import { markFiber, runStateEffects } from "./api";
import { commitEffectList } from "./commit";
import { createDependency, findDependency } from "./context";
import { clone, diff } from "./diff";
import {
  createNext,
  Fiber,
  FiberEl,
  findEls,
  FLAG,
  ReconcileState,
  isComponent,
  isContext,
  isElement,
  // isMemo,
  isPortal,
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

// reconcile walker
const [next, addHook] = createNext();

const setWorkingPreEl = (fiber: Fiber, workingPreEl: FiberEl | undefined) => {
  if (fiber.reconcileState) fiber.reconcileState.workingPreEl = workingPreEl;
};

const setReuseFiberPreEl = (fiber: Fiber) => {
  if (fiber.commitFlag !== FLAG.REUSE) return;
  const endEl = findEls([fiber.alternate!]).pop();
  endEl && setWorkingPreEl(fiber, endEl);
};

// preEl
addHook({
  down: (from: Fiber, to?: Fiber) => {
    isElement(from) && setWorkingPreEl(from, undefined);
    isPortal(from) && setWorkingPreEl(from, undefined);
  },

  up: (from: Fiber, to?: Fiber) => {
    if (to) {
      isElement(to) && setWorkingPreEl(from, to.el);
      isPortal(to) && setWorkingPreEl(from, to.preEl);
    }
    setReuseFiberPreEl(from);
  },

  sibling: (from: Fiber, to?: Fiber) => {
    if (from.commitFlag === FLAG.REUSE) {
      setReuseFiberPreEl(from);
    } else {
      isElement(from) && setWorkingPreEl(from, from.el);
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
addHook({
  down: (from: Fiber, to?: Fiber) => {
    isContext(from) &&
      from.reconcileState!.dependencyList.push(createDependency(from.parent!));
  },

  up: (from: Fiber, to?: Fiber) => {
    isContext(from) && from.reconcileState!.dependencyList.pop();
  },

  enter: (enter: Fiber, skipChild: boolean) => {
    if (
      enter.alternate &&
      isContext(enter.alternate) &&
      !Object.is(enter.alternate.props.value, enter.props.value)
    ) {
      let alternate = enter.alternate;
      let indexFiber: Fiber | undefined = alternate;

      const [next, addHook] = createNext();

      addHook({ up: (from, to) => to !== alternate });

      do {
        findDependency(indexFiber, enter) && markFiber(indexFiber);
        indexFiber = next(
          indexFiber,
          indexFiber !== alternate &&
            isContext(indexFiber) &&
            indexFiber.parent?.type === enter.parent?.type
        );
      } while (indexFiber);
    }
  },
});

export const startWork = (rootCurrentFiber: Fiber) => {
  addMacroTask(() => performWork(rootCurrentFiber));
};

const performWork = (rootCurrentFiber: Fiber) => {
  const rootWorkingFiber = clone(
    {
      props: rootCurrentFiber.props,
      type: rootCurrentFiber.type,
    },
    rootCurrentFiber
  );

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
  if (fiber.commitFlag === FLAG.REUSE) return next(fiber, true);

  if (isComponent(fiber)) {
    updateComponent(fiber);
  } else {
    updateHost(fiber);
  }

  // if (
  //   isElement(fiber) ||
  //   isPortal(fiber) ||
  //   isContext(fiber) ||
  //   isMemo(fiber)
  // ) {
  //   updateHost(fiber);
  // } else if (isComponent(fiber)) {
  //   updateComponent(fiber);
  // }

  !fiber.commitFlag && delete fiber.alternate;

  return next(fiber);
};

const updateHost = (fiber: Fiber) => {
  diff(fiber, fiber.alternate?.children, formatChildren(fiber.props.children));
};

const updateComponent = (fiber: Fiber) => {
  if (!fiber.renderFn) {
    fiber.renderFn = fiber.type as Function;
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
