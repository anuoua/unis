import { Effect } from "./api";
import { Dependency } from "./context";
import { AttrDiff } from "./diff";
import { isFun, isNullish } from "./utils";

export interface ReconcileState {
  // rootCurrentFiber: Fiber;
  // rootWorkingFiber: Fiber;
  dispatchBindList: Fiber[];
  effectList: Fiber[];
  dependencyList: Dependency[];
  workingPreEl: FiberEl | undefined;
}

export enum FLAG {
  CREATE = 1 << 1,
  INSERT = 1 << 2,
  UPDATE = 1 << 3,
  DELETE = 1 << 4,
  REUSE = 1 << 5,
}

export type FlagName = "flag" | "childFlag" | "commitFlag";

export const mergeFlag = (a: FLAG | undefined, b: FLAG) =>
  isNullish(a) ? b : a | b;

export const clearFlag = (a: FLAG | undefined, b: FLAG) =>
  isNullish(a) ? a : a & ~b;

export const matchFlag = (a: FLAG | undefined, b: FLAG) =>
  isNullish(a) ? false : a & b;

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
  tag?: string | Function;
  type?: Symbol;
  renderFn?: Function;
  rendered?: any;
  flag?: FLAG;
  childFlag?: FLAG;
  commitFlag?: FLAG;
  children?: Fiber[];
  nextEffect?: Fiber;
  stateEffects?: Effect[];
  dispatchBindEffects?: (() => void)[];
  effects?: Effect[];
  dependencies?: Dependency[];
  reconcileState?: ReconcileState;
}

export const createFiber = (options: Partial<Fiber> = {}) => {
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
    props: undefined,
    compare: undefined,
    attrDiff: undefined,
    alternate: undefined,
    tag: undefined,
    type: undefined,
    renderFn: undefined,
    rendered: undefined,
    flag: undefined,
    childFlag: undefined,
    commitFlag: undefined,
    children: undefined,
    nextEffect: undefined,
    stateEffects: undefined,
    dispatchBindEffects: undefined,
    effects: undefined,
    dependencies: undefined,
    reconcileState: undefined,
    ...options,
  } as Fiber;
};

export const TEXT = Symbol("$$Text");
export const ELEMENT = Symbol("$$Element");
export const PORTAL = Symbol("$$Portal");
export const MEMO = Symbol("$$Memo");
export const CONTEXT = Symbol("$$Context");
export const COMPONENT = Symbol("$$Component");

export const isText = (fiber: Fiber) => fiber.type === TEXT;
export const isElement = (fiber: Fiber) => fiber.type === ELEMENT;
export const isDOM = (fiber: Fiber) => isElement(fiber) || isText(fiber);

export const isPortal = (fiber: Fiber) => fiber.type === PORTAL;
export const isMemo = (fiber: Fiber) => fiber.type === MEMO;
export const isContext = (fiber: Fiber) => fiber.type === CONTEXT;
export const isCustomComponent = (fiber: Fiber) => fiber.type === COMPONENT;
export const isComponent = (fiber: Fiber) => isFun(fiber.tag);

export const isSame = (fiber1?: Fiber, fiber2?: Fiber) =>
  fiber1 &&
  fiber2 &&
  fiber1.tag === fiber2.tag &&
  fiber1.props?.key === fiber2.props?.key;

export interface WalkHook {
  enter?: (currentFiber: Fiber, skipChild: boolean) => any;
  down?: (currentFiber: Fiber, nextFiber: Fiber) => any;
  sibling?: (currentFiber: Fiber, nextFiber?: Fiber) => any;
  up?: (currentFiber: Fiber, nextFiber?: Fiber) => any;
  return?: (currentFiber?: Fiber) => any;
}

export type WalkHookKeys = keyof WalkHook;

export type WalkHookList = {
  [K in keyof WalkHook]: WalkHook[K][];
};

export const createNext = () => {
  const walkHooks: WalkHookList = {};

  const addHook = (walkHook: WalkHook) => {
    Object.entries(walkHook).forEach(([key, value]) => {
      const list = walkHooks[key as WalkHookKeys];
      list ? list.push(value) : (walkHooks[key as WalkHookKeys] = [value]);
    });
  };

  const runWalkHooks = <T extends WalkHookKeys>(
    key: T,
    ...args: Parameters<Required<WalkHook>[T]>
  ) => {
    return walkHooks[key]?.map((hook) => hook!(...(args as [any, any])));
  };

  const next = (fiber: Fiber, skipChild = false): Fiber | undefined => {
    if (runWalkHooks("enter", fiber, skipChild)?.includes(false)) return;
    const { child } = fiber;
    let nextFiber: Fiber | undefined = fiber;
    if (child && !skipChild) {
      runWalkHooks("down", nextFiber, child);
      nextFiber = child;
    } else {
      while (nextFiber) {
        const { sibling, parent } = nextFiber as Fiber;
        if (sibling) {
          runWalkHooks("sibling", nextFiber, sibling);
          nextFiber = sibling;
          break;
        }
        if (runWalkHooks("up", nextFiber, parent)?.includes(false)) {
          nextFiber = undefined;
          break;
        }
        nextFiber = parent;
      }
    }
    runWalkHooks("return", nextFiber);
    return nextFiber;
  };

  return [next, addHook] as const;
};

export const graft = (newFiber: Fiber, oldFiber: Fiber) => {
  const parent = newFiber.parent!;
  const parentChildren = parent.children!;
  const index = newFiber.index!;
  const preIndex = index - 1;

  if (index === 0) parent.child = oldFiber;
  if (preIndex >= 0) parentChildren[preIndex].sibling = oldFiber;

  parentChildren[index] = oldFiber;

  oldFiber.sibling = newFiber.sibling;
  oldFiber.parent = parent;
};

export const findEls = (fibers: Fiber[] = []) => {
  const els: FiberEl[] = [];

  for (let fiber of fibers) {
    isDOM(fiber)
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

export const findRoot = ((fiber: Fiber | undefined) => {
  while ((fiber = fiber?.parent)) {
    if (!fiber.parent) return fiber;
  }
}) as (fiber: Fiber) => Fiber;
