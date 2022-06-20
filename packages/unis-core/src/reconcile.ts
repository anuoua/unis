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
  isComponent,
  isContext,
  isElement,
  isMemo,
  isPortal,
} from "./fiber";
import { formatChildren } from "./h";
import { addMacroTask, addMicroTask, shouldYield } from "./scheduler";
import { isFun } from "./utils";

let rootWorkingFiber: Fiber | undefined;

export const getWorkingFiber = () => rootWorkingFiber;
export const setWorkingFiber = (fiber: Fiber | undefined) =>
  (rootWorkingFiber = fiber);

export const pushEffect = (fiber: Fiber) =>
  fiber.globalState?.effectList?.push(fiber);

// reconcile walker
const [next, addHook] = createNext();

const setWorkingPreEl = (fiber: Fiber, workingPreEl: FiberEl | undefined) => {
  if (fiber.globalState) fiber.globalState.workingPreEl = workingPreEl;
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
    if (retn) retn.preEl = retn.globalState?.workingPreEl;
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
      from.globalState?.dependencyList?.push(createDependency(from.parent!));
  },

  up: (from: Fiber, to?: Fiber) => {
    isContext(from) && from.globalState?.dependencyList?.pop();
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
  rootWorkingFiber = clone(
    {
      props: rootCurrentFiber.props,
      type: rootCurrentFiber.type,
    },
    rootCurrentFiber
  );

  rootWorkingFiber.globalState = rootCurrentFiber.globalState ?? {};

  Object.assign(rootWorkingFiber.globalState, {
    rootCurrentFiber,
    rootWorkingFiber,
    effectList: [],
    dependencyList: [],
  });

  tickWork(rootWorkingFiber!);
};

const tickWork = (workingFiber: Fiber | undefined) => {
  let preWorkingFiber = workingFiber;
  while (workingFiber && !shouldYield()) {
    preWorkingFiber = workingFiber;
    workingFiber = update(workingFiber);
    setWorkingFiber(workingFiber);
  }
  if (workingFiber) {
    addMicroTask(() => {
      setWorkingFiber(workingFiber);
      tickWork(workingFiber);
    });
  } else {
    commitEffectList(preWorkingFiber?.globalState?.effectList ?? []);
  }
};

const update = (fiber: Fiber) => {
  if (fiber.commitFlag === FLAG.REUSE) return next(fiber, true);

  if (
    isElement(fiber) ||
    isPortal(fiber) ||
    isContext(fiber) ||
    isMemo(fiber)
  ) {
    updateHost(fiber);
  } else if (isComponent(fiber)) {
    updateComponent(fiber);
  }

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
    fiber.rendered = rendered;
  } else {
    runStateEffects(fiber);
    if (fiber.commitFlag) fiber.rendered = fiber.renderFn(fiber.props);
  }

  diff(fiber, fiber.alternate?.children, formatChildren(fiber.rendered));
};
