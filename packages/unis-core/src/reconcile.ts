import { runStateEffects } from "./api";
import { commitEffectList } from "./commit";
import { preElWalkHook } from "./preEl";
import { effectWalkHook } from "./effect";
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

export const startWork = (rootCurrentFiber: Fiber) => {
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
    addTik(() => {
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
