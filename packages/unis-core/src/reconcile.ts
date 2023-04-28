import {
  clearAndRunEffects,
  clearEffects,
  Effect,
  EFFECT_TYPE,
  effectDepsEqual,
  runEffects,
  runStateEffects,
} from "./api/utils";
import {
  createNext,
  Fiber,
  FLAG,
  ReconcileState,
  isComponent,
  createFiber,
  matchFlag,
  findRuntime,
  isElement,
} from "./fiber";
import { commit } from "./commit";
import { preElFiberWalkHook } from "./reconcileWalkHooks/preElFiber";
import { effectWalkHook } from "./reconcileWalkHooks/effect";
import { formatChildren } from "./h";
import { isFun } from "./utils";
import { diff } from "./diff";
import { contextWalkHook } from "./reconcileWalkHooks/context";
import { cutMemorizeState } from "./api/useReducer";

let workingFiber: Fiber | undefined;

export const getWorkingFiber = () => workingFiber;
export const setWorkingFiber = (fiber: Fiber | undefined) =>
  (workingFiber = fiber);

// reconcile walker
const [next, addHook] = createNext();

// preEl
addHook(preElFiberWalkHook);
// effect
addHook(effectWalkHook);
// context
addHook(contextWalkHook);

export const readyForWork = (rootCurrentFiber: Fiber, hydrate = false) => {
  rootCurrentFiber.runtime!.toktik.addTok(() =>
    performWork(rootCurrentFiber, hydrate)
  );
};

const performWork = (rootCurrentFiber: Fiber, hydrate: boolean) => {
  const rootWorkingFiber = createFiber({
    index: rootCurrentFiber.index,
    tag: rootCurrentFiber.tag,
    type: rootCurrentFiber.type,
    props: rootCurrentFiber.props,
    alternate: rootCurrentFiber,
    el: rootCurrentFiber.el,
    runtime: rootCurrentFiber.runtime,
  });

  const initialReconcileState: ReconcileState = {
    rootWorkingFiber,
    dispatchEffectList: [],
    commitList: [],
    dependencyList: [],
    workingPreElFiber: undefined,
    hydrate,
    hydrateEl: rootCurrentFiber.el,
  };

  rootWorkingFiber.reconcileState = initialReconcileState;

  setWorkingFiber(rootWorkingFiber);
  tickWork(rootWorkingFiber!);
};

const tickWork = (workingFiber: Fiber) => {
  const { toktik } = findRuntime(workingFiber);

  let iFiber: Fiber | undefined = workingFiber;

  // work loop
  while (iFiber && !toktik.shouldYield()) {
    const isReuse = !!matchFlag(iFiber.commitFlag, FLAG.REUSE);
    {
      !isReuse && update(iFiber);
      !isReuse && isElement(iFiber) && compose(iFiber);
      complete(iFiber);
    }
    iFiber = next(iFiber, isReuse);
    setWorkingFiber(iFiber);
  }

  if (iFiber) {
    toktik.addTik(() => {
      setWorkingFiber(iFiber);
      tickWork(iFiber!);
    });
  } else {
    const { reconcileState } = workingFiber;

    // switch dispatch bind fiber
    runEffects(reconcileState!.dispatchEffectList);

    // commit
    commit(reconcileState!);

    // call component effects
    callComponentEffects(reconcileState!);

    // clear reconcileState
    for (const prop of Object.keys(reconcileState!)) {
      delete reconcileState![prop as keyof ReconcileState];
    }
  }
};

const callComponentEffects = (reconcileState: ReconcileState) => {
  const { commitList, rootWorkingFiber } = reconcileState!;
  const { toktik } = rootWorkingFiber.runtime!;

  const triggeredLayoutEffects: Effect[] = [];
  const tickEffects: Effect[] = [];

  // clear and run layoutEffects
  for (const fiber of commitList) {
    for (const effect of fiber.effects ?? []) {
      if (effect.type === EFFECT_TYPE.TICK) {
        tickEffects.push(effect);
      } else {
        const equal = effectDepsEqual(effect);
        if (!equal) {
          triggeredLayoutEffects.push(effect);
          clearEffects([effect]);
        }
      }
    }
  }

  // run triggered layout effects
  runEffects(triggeredLayoutEffects);

  // clear and run tick effects
  toktik.addTik(() => clearAndRunEffects(tickEffects));
};

const update = (fiber: Fiber) => {
  if (isComponent(fiber)) {
    updateComponent(fiber);
  } else {
    updateHost(fiber);
  }
};

const updateHost = (fiber: Fiber) => {
  diff(fiber, fiber.alternate?.children, formatChildren(fiber.props.children));
};

const updateComponent = (fiber: Fiber) => {
  if (!fiber.renderFn) {
    fiber.renderFn = fiber.tag as Function;
    let rendered = fiber.renderFn(fiber.props);
    if (isFun(rendered)) {
      fiber.renderFn = rendered;
      rendered = fiber.renderFn!();
    }
    fiber.rendered = formatChildren(rendered);
  } else {
    runStateEffects(fiber);
    if (matchFlag(fiber.commitFlag, FLAG.UPDATE)) {
      fiber.rendered = formatChildren(fiber.renderFn(fiber.props));
    } else {
      /**
       * this condition, means `fiber.alternate` is on childFlag marked chain, and `fiber.commitFlag` is undefined.
       * diff will keep going on.
       */
    }
  }

  cutMemorizeState(fiber);

  diff(fiber, fiber.alternate?.children, fiber.rendered);
};

const compose = (fiber: Fiber) => {
  const { hydrate, hydrateEl } = fiber.reconcileState!;
  const { operator } = findRuntime(fiber);

  if (hydrate && hydrateEl) {
    if (!operator.matchElement(fiber, hydrateEl))
      throw new Error("Hydrate failed!");
    fiber.el = hydrateEl;
    fiber.reconcileState!.hydrateEl = operator.nextElement(hydrateEl);
  } else if (matchFlag(fiber.commitFlag, FLAG.CREATE) && !hydrate) {
    fiber.el = operator.createElement(fiber);
    if (fiber.attrDiff?.length) operator.updateElementProperties(fiber);
  }
};

const complete = (fiber: Fiber) => {
  !fiber.commitFlag && (fiber.alternate = undefined);
};
