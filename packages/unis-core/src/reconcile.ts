import {
  clearAndRunEffects,
  clearEffects,
  Effect,
  effectDepsEqual,
  runEffects,
  runStateEffects,
} from "./api";
import { commit } from "./commit";
import { preElWalkHook } from "./reconcileWalkHooks/preEl";
import { effectWalkHook } from "./reconcileWalkHooks/effect";
import { contextWalkHook } from "./context";
import {
  createNext,
  Fiber,
  FLAG,
  ReconcileState,
  isComponent,
  createFiber,
  matchFlag,
} from "./fiber";
import { formatChildren } from "./h";
import { addTok, addTik, shouldYield } from "./toktik";
import { isFun } from "./utils";
import { diff } from "./diff";

let workingFiber: Fiber | undefined;

export const getWorkingFiber = () => workingFiber;
export const setWorkingFiber = (fiber: Fiber | undefined) =>
  (workingFiber = fiber);

// reconcile walker
const [next, addHook] = createNext();

// preEl
addHook(preElWalkHook);
// effect
addHook(effectWalkHook);
// context
addHook(contextWalkHook);

export const readyForWork = (rootCurrentFiber: Fiber) => {
  addTok(() => performWork(rootCurrentFiber));
};

const performWork = (rootCurrentFiber: Fiber) => {
  const rootWorkingFiber = createFiber({
    index: rootCurrentFiber.index,
    tag: rootCurrentFiber.tag,
    type: rootCurrentFiber.type,
    props: rootCurrentFiber.props,
    alternate: rootCurrentFiber,
    el: rootCurrentFiber.el,
  });

  const initialReconcileState: ReconcileState = {
    dispatchEffectList: [],
    commitList: [],
    tickEffectList: [],
    layoutEffectList: [],
    dependencyList: [],
    workingPreEl: undefined,
  };

  rootWorkingFiber.reconcileState = initialReconcileState;

  setWorkingFiber(rootWorkingFiber);
  tickWork(rootWorkingFiber!);
};

const tickWork = (workingFiber: Fiber) => {
  let indexFiber: Fiber | undefined = workingFiber;
  while (indexFiber && !shouldYield()) {
    indexFiber = update(indexFiber);
    setWorkingFiber(indexFiber);
  }
  if (indexFiber) {
    addTik(() => {
      setWorkingFiber(indexFiber);
      tickWork(indexFiber!);
    });
  } else {
    const { reconcileState } = workingFiber;

    // switch dispatch bind fiber
    runEffects(reconcileState!.dispatchEffectList);

    // commit to dom
    commit(reconcileState!);

    // call effects
    callEffects(reconcileState!);

    // clear reconcileState
    for (const prop of Object.keys(reconcileState!)) {
      delete reconcileState![prop as keyof ReconcileState];
    }
  }
};

const callEffects = (reconcileState: ReconcileState) => {
  const { layoutEffectList, tickEffectList } = reconcileState!;

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
  addTik(() => clearAndRunEffects(tickEffectList));
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

const cutMemorizeState = (fiber: Fiber) => {
  const first = fiber.memorizeState?.next;
  fiber.memorizeState && (fiber.memorizeState.next = undefined);
  fiber.memorizeState = first;
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
