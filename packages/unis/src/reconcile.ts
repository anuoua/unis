import { markFiber } from "./api";
import { commitEffectList } from "./commit";
import { Dependency, createDependency, findDependency } from "./context";
import { clone, diff } from "./diff";
import { findEls } from "./dom";
import {
  createNext,
  Fiber,
  FiberEl,
  FLAG,
  isComponent,
  isContext,
  isElement,
  isMemo,
  isPortal,
} from "./fiber";
import { formatChildren } from "./h";
import { nextTick, shouldYield } from "./schedule";
import { isFun } from "./utils";

let rootCurrentFiber: Fiber;
let rootWorkingFiber: Fiber;

let effectList: Fiber[] = [];
let dependencyList: Dependency[] = [];

let workingFiber: Fiber | undefined;
let workingPreEl: FiberEl | undefined;

export const getWorkingFiber = () => workingFiber;
export const setWorkingFiber = (fiber: Fiber | undefined) =>
  (workingFiber = fiber);

export const getDependency = () => dependencyList;

export const pushEffect = (fiber: Fiber) => effectList.push(fiber);

const setReuseFiberPreEl = (fiber: Fiber) => {
  if (fiber.commitFlag !== FLAG.REUSE) return;
  const endEl = findEls([fiber.alternate!]).pop();
  endEl && (workingPreEl = endEl);
};

// reconcile walker
const [next, addHook] = createNext();

// preEl
addHook({
  down: (from: Fiber, to?: Fiber) => {
    isElement(from) && (workingPreEl = undefined);
    isPortal(from) && (workingPreEl = undefined);
  },

  up: (from: Fiber, to?: Fiber) => {
    if (to) {
      isElement(to) && (workingPreEl = to.el);
      isPortal(to) && (workingPreEl = to.preEl);
    }
    setReuseFiberPreEl(from);
  },

  sibling: (from: Fiber, to?: Fiber) => {
    if (from.commitFlag === FLAG.REUSE) {
      setReuseFiberPreEl(from);
    } else {
      isElement(from) && (workingPreEl = from.el);
    }
  },

  return: (retn?: Fiber) => {
    if (retn) retn.preEl = workingPreEl;
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
    isContext(from) && dependencyList.push(createDependency(from.parent!));
  },

  up: (from: Fiber, to?: Fiber) => {
    isContext(from) && dependencyList.pop();
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

export const startWork = (rootFiber?: Fiber) => {
  !rootCurrentFiber && rootFiber && (rootCurrentFiber = rootFiber);

  rootWorkingFiber = workingFiber = clone(
    {
      props: rootCurrentFiber.props,
      index: rootCurrentFiber.index,
      type: rootCurrentFiber.type,
    },
    rootCurrentFiber
  );

  tickWork();
};

const tickWork = () => {
  while (workingFiber && !shouldYield()) {
    workingFiber = update(workingFiber);
  }
  if (workingFiber) {
    nextTick(() => tickWork());
  } else {
    commitEffectList(effectList);
    rootCurrentFiber = rootWorkingFiber;
    workingFiber = undefined;
    effectList = [];
  }
};

const update = (fiber: Fiber) => {
  if (fiber.commitFlag === FLAG.REUSE) return next(fiber, true);

  if (isElement(fiber) || isPortal(fiber) || isContext(fiber)) {
    updateHost(fiber);
  } else if (isMemo(fiber)) {
    updateMemo(fiber);
  } else if (isComponent(fiber)) {
    updateComponent(fiber);
  }

  !fiber.commitFlag && delete fiber.alternate;

  return next(fiber);
};

const updateHost = (fiber: Fiber) => {
  diff(fiber, fiber.alternate?.children, formatChildren(fiber.props.children));
};

const updateMemo = (fiber: Fiber) => {
  const newMemoChild = fiber.props.children;
  const oldMemoChild = fiber.alternate?.children?.[0]!;
  if (
    fiber.commitFlag !== FLAG.CREATE &&
    !fiber.alternate!.childFlag &&
    fiber.compare?.(newMemoChild.props, oldMemoChild.props)
  ) {
    const newChild = clone(newMemoChild, oldMemoChild, FLAG.REUSE);
    newChild.index = 0;
    newChild.parent = fiber;
    fiber.child = newChild;
    fiber.children = [newChild];
  } else {
    updateHost(fiber);
  }
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
    for (let effect of fiber.stateEffects ?? []) {
      effect();
    }
    if (fiber.commitFlag) fiber.rendered = fiber.renderFn(fiber.props);
  }

  diff(fiber, fiber.alternate?.children, formatChildren(fiber.rendered));
};
