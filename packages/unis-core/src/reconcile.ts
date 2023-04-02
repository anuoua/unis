import {
  clearAndRunEffects,
  clearEffects,
  Effect,
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
} from "./fiber";
import { commit } from "./commit";
import { preElFiberWalkHook } from "./reconcileWalkHooks/preElFiber";
import { effectWalkHook } from "./reconcileWalkHooks/effect";
import { formatChildren } from "./h";
import { isFun } from "./utils";
import { diff } from "./diff";
import { contextWalkHook } from "./reconcileWalkHooks/context";
import { cutMemorizeState } from "./unis";

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
    tickEffectList: [],
    layoutEffectList: [],
    dependencyList: [],
    workingPreElFiber: undefined,
    hydrate,
    hydrateNextEl:
      rootCurrentFiber.runtime!.operator.findNextDomElement(rootCurrentFiber),
  };

  rootWorkingFiber.reconcileState = initialReconcileState;

  setWorkingFiber(rootWorkingFiber);
  tickWork(rootWorkingFiber!);
};

const tickWork = (workingFiber: Fiber) => {
  const { toktik } = findRuntime(workingFiber);
  let indexFiber: Fiber | undefined = workingFiber;
  while (indexFiber && !toktik.shouldYield()) {
    indexFiber = update(indexFiber);
    setWorkingFiber(indexFiber);
  }
  if (indexFiber) {
    toktik.addTik(() => {
      setWorkingFiber(indexFiber);
      tickWork(indexFiber!);
    });
  } else {
    const { reconcileState } = workingFiber;

    // switch dispatch bind fiber
    runEffects(reconcileState!.dispatchEffectList);

    // commit to dom
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
  const { layoutEffectList, tickEffectList, rootWorkingFiber } =
    reconcileState!;
  const { toktik } = rootWorkingFiber.runtime!;

  // clear and run layoutEffects
  const triggeredLayoutEffects: Effect[] = [];

  layoutEffectList?.forEach((e) => {
    const equal = effectDepsEqual(e);
    if (!equal) {
      triggeredLayoutEffects.push(e);
      clearEffects([e]);
    }
  });

  // run triggered layout effects
  runEffects(triggeredLayoutEffects);

  // clear and run tick effects
  toktik.addTik(() => clearAndRunEffects(tickEffectList));
};

const update = (fiber: Fiber) => {
  if (matchFlag(fiber.commitFlag, FLAG.REUSE)) return next(fiber, true);

  if (isComponent(fiber)) {
    updateComponent(fiber);
  } else {
    updateHost(fiber);
  }

  !fiber.commitFlag && delete fiber.alternate;

  return next(fiber);
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
