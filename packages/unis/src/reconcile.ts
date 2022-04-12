import { markFiber } from "./api";
import { commitEffectList } from "./commit";
import { ContextItem, contextMap, createContextItem } from "./context";
import { clone, diff } from "./diff";
import { createElement, findEls } from "./dom";
import {
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

let effectList: Fiber;
let contextList: ContextItem[] = [];

let workingFiber: Fiber | undefined;
let workingEffect: Fiber | undefined;
let workingPreEl: FiberEl | undefined;

export const getWorkingFiber = () => workingFiber;
export const setWorkingFiber = (fiber: Fiber | undefined) =>
  (workingFiber = fiber);
export const getContextList = () => contextList;

export const effectLink = (fiber: Fiber) => {
  if (!workingEffect) return;
  workingEffect.nextEffect = fiber;
  workingEffect = fiber;
};

export const setReuseFiberPreEl = (fiber: Fiber) => {
  if (fiber.commitFlag === FLAG.REUSE) {
    const endEl = findEls([fiber.alternate!]).pop();
    endEl && (workingPreEl = endEl);
  }
};

export const next = (fiber: Fiber, skipChild = false): Fiber | undefined => {
  hook.enter(fiber, skipChild);
  let nextFiber: Fiber | undefined = fiber;
  if (nextFiber.child && !skipChild) {
    hook.down(nextFiber, nextFiber.child);
    nextFiber = nextFiber.child;
  } else {
    while (nextFiber) {
      if (nextFiber.sibling) {
        hook.sibling(nextFiber, nextFiber.sibling);
        nextFiber = nextFiber.sibling;
        break;
      }
      hook.up(nextFiber, nextFiber.parent);
      nextFiber = nextFiber.parent;
    }
  }
  hook.return(nextFiber);
  return nextFiber;
};

export const hook = {
  down: (from: Fiber, to?: Fiber) => {
    {
      // preEl
      isElement(from) && (workingPreEl = undefined);
      isPortal(from) && (workingPreEl = undefined);
    }
    {
      // context
      isContext(from) && contextList.push(createContextItem(from.parent!));
    }
  },

  up: (from: Fiber, to?: Fiber) => {
    {
      // preEl
      if (to) {
        isElement(to) && (workingPreEl = to.el);
        isPortal(to) && (workingPreEl = to.preEl);
      }
      setReuseFiberPreEl(from);
    }
    {
      // effect
      to?.commitFlag && effectLink(to);
    }
    {
      // context
      isContext(from) && contextList.pop();
    }
  },

  sibling: (from: Fiber, to?: Fiber) => {
    {
      // preEl
      if (from.commitFlag === FLAG.REUSE) {
        setReuseFiberPreEl(from);
      } else {
        isElement(from) && (workingPreEl = from.el);
      }
    }
  },

  enter: (enter: Fiber, skipChild: boolean) => {
    {
      // effect
      (!enter.child || skipChild) && enter.commitFlag && effectLink(enter);
    }
    {
      // context
      if (
        enter.alternate &&
        isContext(enter.alternate) &&
        !Object.is(enter.alternate.props.value, enter.props.value)
      ) {
        let alternate = enter.alternate;
        let indexFiber: Fiber | undefined = alternate;

        const next = (indexFiber: Fiber | undefined, skipChild = false) => {
          if (indexFiber?.child && !skipChild) return indexFiber.child;
          while (indexFiber) {
            if (indexFiber.sibling) return indexFiber.sibling;
            if (indexFiber === alternate) return;
            indexFiber = indexFiber.parent;
            if (indexFiber === alternate) return;
          }
        };

        const find = (indexFiber: Fiber) =>
          indexFiber.dependencies?.find(
            (contextItem) =>
              contextItem.context ===
              contextMap.get(enter.parent?.type as Function)
          );

        do {
          find(indexFiber) && markFiber(indexFiber);
        } while (
          (indexFiber = next(
            indexFiber,
            indexFiber !== alternate &&
              isContext(indexFiber) &&
              indexFiber.parent?.type === enter.parent?.type
          ))
        );
      }
    }
  },

  return: (retn?: Fiber) => {
    {
      // preEl
      if (retn) retn.preEl = workingPreEl;
    }
  },
};

export const startWork = (rootFiber?: Fiber) => {
  !rootCurrentFiber && rootFiber && (rootCurrentFiber = rootFiber);

  workingEffect =
    effectList =
    workingFiber =
    rootWorkingFiber =
      clone(
        {
          props: rootCurrentFiber.props,
          index: rootCurrentFiber.index,
          type: rootCurrentFiber.type,
        },
        rootCurrentFiber
      );

  tickWork();
};

export const tickWork = () => {
  while (workingFiber && !shouldYield()) {
    workingFiber = update(workingFiber);
  }
  if (workingFiber) {
    nextTick(() => tickWork());
  } else {
    const firstEffect = effectList.nextEffect;
    delete effectList.nextEffect;
    commitEffectList(firstEffect);
    rootCurrentFiber = rootWorkingFiber;
    workingFiber = undefined;
  }
};

export const update = (fiber: Fiber) => {
  if (fiber.commitFlag === FLAG.REUSE) return next(fiber, true);
  if (isElement(fiber)) {
    if (fiber.commitFlag === FLAG.CREATE) fiber.el = createElement(fiber);
    updateHost(fiber);
  } else if (isPortal(fiber)) {
    updateHost(fiber);
  } else if (isMemo(fiber)) {
    updateMemo(fiber);
  } else if (isContext(fiber)) {
    updateHost(fiber);
  } else if (isComponent(fiber)) {
    updateComponent(fiber);
  }
  !fiber.commitFlag && delete fiber.alternate;
  return next(fiber);
};

export const updateHost = (fiber: Fiber) => {
  diff(fiber, fiber.alternate?.children, formatChildren(fiber.props.children));
};

export const updateMemo = (fiber: Fiber) => {
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

export const updateComponent = (fiber: Fiber) => {
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
