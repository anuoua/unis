import { runStateEffects } from "./api";
import { commitEffectList } from "./commit";
import { contextWalkHook } from "./context";
import { diff } from "./diff";
import {
  createNext,
  Fiber,
  FiberEl,
  findEls,
  FLAG,
  ReconcileState,
  isComponent,
  isDOM,
  isPortal,
  createFiber,
  matchFlag,
} from "./fiber";
import { formatChildren } from "./h";
import { addMacroTask, addMicroTask, shouldYield } from "./scheduler";
import { isFun } from "./utils";

let workingFiber: Fiber | undefined;

export const getWorkingFiber = () => workingFiber;
export const setWorkingFiber = (fiber: Fiber | undefined) =>
  (workingFiber = fiber);

export const pushEffect = (fiber: Fiber) =>
  fiber.reconcileState!.effectList.push(fiber);

const setWorkingPreEl = (fiber: Fiber, workingPreEl: FiberEl | undefined) => {
  if (fiber.reconcileState) fiber.reconcileState.workingPreEl = workingPreEl;
};

const setReuseFiberPreEl = (fiber: Fiber) => {
  if (!matchFlag(fiber.commitFlag, FLAG.REUSE)) return;
  const endEl = findEls([fiber.alternate!]).pop();
  endEl && setWorkingPreEl(fiber, endEl);
};

// reconcile walker
const [next, addHook] = createNext();

// preEl
addHook({
  down: (from: Fiber, to?: Fiber) => {
    isDOM(from) && setWorkingPreEl(from, undefined);
    isPortal(from) && setWorkingPreEl(from, undefined);
  },

  up: (from: Fiber, to?: Fiber) => {
    if (to) {
      isDOM(to) && setWorkingPreEl(from, to.el);
      isPortal(to) && setWorkingPreEl(from, to.preEl);
    }
    setReuseFiberPreEl(from);
  },

  sibling: (from: Fiber, to?: Fiber) => {
    if (matchFlag(from.commitFlag, FLAG.REUSE)) {
      setReuseFiberPreEl(from);
    } else {
      isDOM(from) && setWorkingPreEl(from, from.el);
    }
  },

  return: (retn?: Fiber) => {
    if (retn) retn.preEl = retn.reconcileState!.workingPreEl;
  },
});

// effect
addHook({
  up: (from: Fiber, to?: Fiber) => {
    to?.commitFlag && pushEffect(to);
  },

  enter: (enter: Fiber, skipChild: boolean) => {
    (!enter.child || skipChild) && enter.commitFlag && pushEffect(enter);
  },
});

// context
addHook(contextWalkHook);

export const startWork = (rootCurrentFiber: Fiber) => {
  addMacroTask(() => performWork(rootCurrentFiber));
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
    rootCurrentFiber,
    rootWorkingFiber,
    effectList: [],
    dependencyList: [],
    workingPreEl: undefined,
  };

  rootWorkingFiber.reconcileState =
    rootCurrentFiber.reconcileState ?? initialReconcileState;

  Object.assign(rootWorkingFiber.reconcileState, initialReconcileState);

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
    addMicroTask(() => {
      setWorkingFiber(indexFiber);
      tickWork(indexFiber!);
    });
  } else {
    commitEffectList(workingFiber.reconcileState!.effectList ?? []);
  }
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
    if (fiber.commitFlag)
      fiber.rendered = formatChildren(fiber.renderFn(fiber.props));
  }

  diff(fiber, fiber.alternate?.children, fiber.rendered);
};
