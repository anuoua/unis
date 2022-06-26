import { Effect } from "./api";
import { Dependency } from "./context";
import { AttrDiff } from "./diff";

export interface ReconcileState {
  rootCurrentFiber: Fiber;
  rootWorkingFiber: Fiber;
  effectList: Fiber[];
  dependencyList: Dependency[];
  workingPreEl: FiberEl | undefined;
}

export enum FLAG {
  CREATE = 1 << 0,
  INSERT = 1 << 1,
  UPDATE = 1 << 2,
  DELETE = 1 << 3,
  REUSE = 1 << 4,
}

export type FiberEl = Element | Text | DocumentFragment | SVGAElement;
export type FiberType =
  | string
  | Function
  | Symbol
  | ((...p: any[]) => () => any);

export interface Fiber {
  id?: string;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  index?: number;
  to?: Element;
  el?: FiberEl;
  preEl?: FiberEl;
  isSVG?: boolean;
  props?: any;
  compare?: Function;
  attrDiff?: AttrDiff;
  alternate?: Fiber;
  type?: FiberType;
  renderFn?: Function;
  rendered?: any;
  flag?: FLAG;
  childFlag?: FLAG;
  commitFlag?: FLAG;
  children?: Fiber[];
  nextEffect?: Fiber;
  stateEffects?: Effect[];
  effects?: Effect[];
  dependencies?: Dependency[];
  reconcileState?: ReconcileState;
}

export const createFiber = (type?: FiberType, props?: any) => {
  return {
    id: undefined,
    parent: undefined,
    child: undefined,
    sibling: undefined,
    index: undefined,
    to: undefined,
    el: undefined,
    preEl: undefined,
    isSVG: undefined,
    props,
    compare: undefined,
    attrDiff: undefined,
    alternate: undefined,
    type,
    renderFn: undefined,
    rendered: undefined,
    flag: undefined,
    childFlag: undefined,
    commitFlag: undefined,
    children: undefined,
    nextEffect: undefined,
    stateEffects: undefined,
    effects: undefined,
    dependencies: undefined,
    reconcileState: undefined,
  } as Fiber;
};

export const TEXT = "$$Text";
export const PORTAL = Symbol("$$Portal");
export const MEMO = Symbol("$$Memo");
export const CONTEXT = Symbol("$$Context");

export const isText = (fiber: Fiber) => fiber.type === TEXT;
export const isPortal = (fiber: Fiber) => fiber.type === PORTAL;
export const isMemo = (fiber: Fiber) => fiber.type === MEMO;
export const isMemoWrap = (fiber: Fiber) => fiber.rendered?.[0]?.type === MEMO;
export const isContext = (fiber: Fiber) => fiber.type === CONTEXT;
export const isComponent = (fiber: Fiber) => typeof fiber.type === "function";
export const isElement = (fiber: Fiber) => typeof fiber.type === "string";

export const isSame = (fiber1?: Fiber, fiber2?: Fiber) =>
  fiber1 &&
  fiber2 &&
  fiber1.type === fiber2.type &&
  fiber1.props?.key === fiber2.props?.key;

export interface Hook {
  enter?: (currentFiber: Fiber, skipChild: boolean) => any;
  down?: (currentFiber: Fiber, nextFiber: Fiber) => any;
  sibling?: (currentFiber: Fiber, nextFiber?: Fiber) => any;
  up?: (currentFiber: Fiber, nextFiber?: Fiber) => any;
  return?: (currentFiber?: Fiber) => any;
}

export type HookKeys = keyof Hook;

export type HookList = {
  [K in keyof Hook]: Hook[K][];
};

export const createNext = () => {
  const hookStore: HookList = {};

  const addHook = (hook: Hook) => {
    Object.entries(hook).forEach(([key, value]) => {
      const list = hookStore[key as HookKeys];
      list ? list.push(value) : (hookStore[key as HookKeys] = [value]);
    });
  };

  const runHooks = <T extends HookKeys>(
    key: T,
    ...args: Parameters<Required<Hook>[T]>
  ) => {
    return hookStore[key]?.map((hook) => hook!(...(args as [any, any])));
  };

  const next = (fiber: Fiber, skipChild = false): Fiber | undefined => {
    if (runHooks("enter", fiber, skipChild)?.includes(false)) return;
    const { child } = fiber;
    let nextFiber: Fiber | undefined = fiber;
    if (child && !skipChild) {
      runHooks("down", nextFiber, child);
      nextFiber = child;
    } else {
      while (nextFiber) {
        const { sibling, parent } = nextFiber as Fiber;
        if (sibling) {
          runHooks("sibling", nextFiber, sibling);
          nextFiber = sibling;
          break;
        }
        if (runHooks("up", nextFiber, parent)?.includes(false)) {
          nextFiber = undefined;
          break;
        }
        nextFiber = parent;
      }
    }
    runHooks("return", nextFiber);
    return nextFiber;
  };

  return [next, addHook] as const;
};

export const graft = (oldFiber: Fiber, newFiber: Fiber) => {
  const parent = oldFiber.parent!;
  const parentChildren = parent.children!;
  const index = oldFiber.index!;
  const preIndex = index - 1;

  if (index === 0) parent.child = newFiber;
  if (preIndex >= 0) parentChildren[preIndex].sibling = newFiber;
  if (oldFiber.sibling) newFiber.sibling = oldFiber.sibling;

  parentChildren[index] = newFiber;
  newFiber.parent = parent;
};

export const findEls = (fibers: Fiber[] = []) => {
  const els: FiberEl[] = [];

  for (let fiber of fibers) {
    isElement(fiber)
      ? els.push(fiber.el!)
      : isPortal(fiber)
      ? false
      : els.push(...(findEls(fiber.children) ?? []));
  }

  return els;
};

export const getContainer = (
  fiber: Fiber | undefined
): [FiberEl | undefined, boolean] | undefined => {
  while ((fiber = fiber?.parent)) {
    if (fiber.to) return [fiber.to, true];
    if (fiber.el) return [fiber.el, false];
  }
};
