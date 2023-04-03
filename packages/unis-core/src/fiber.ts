import { Effect } from "./api/utils";
import { Dependency } from "./context";
import { AttrDiff } from "./diff";
import { isFun, isNullish } from "./utils";

export interface ReconcileState {
  rootWorkingFiber: Fiber;
  dispatchEffectList: Effect[];
  commitList: Fiber[];
  tickEffectList: Effect[];
  layoutEffectList: Effect[];
  dependencyList: Dependency[];
  workingPreElFiber?: Fiber;
  hydrate: boolean;
  hydrateEl?: FiberEl;
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

export type FiberEl = unknown;
export type FiberType =
  | string
  | Function
  | Symbol
  | ((...p: any[]) => () => any);

export interface MemorizeState {
  value: any;
  dispatchValue?: any;
  deps: any[];
  next?: MemorizeState;
}

export interface TokTik {
  addTok: (task: Function, pending?: boolean) => void;
  addTik: (task: Function) => void;
  clearTikTaskQueue: () => void;
  shouldYield: () => boolean;
}

export interface Operator {
  createDomElement(fiber: Fiber): FiberEl;

  findNextDomElement(el: FiberEl): FiberEl | null;

  matchElement(fiber: Fiber, el: FiberEl): boolean;

  insertBefore(
    containerFiber: Fiber,
    insertElement: FiberEl,
    targetElement: FiberEl | null
  ): void;

  firstChild(fiber: Fiber): FiberEl | null;

  nextSibling(fiber: Fiber): FiberEl | null;

  remove(fiber: Fiber): void;

  updateTextProperties(fiber: Fiber): void;

  updateElementProperties(fiber: Fiber): void;
}

export interface Runtime {
  toktik: TokTik;
  operator: Operator;
}

export interface Fiber {
  id?: string;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  index?: number;
  to?: Element;
  el?: FiberEl;
  preElFiber?: Fiber;
  isSvg?: boolean;
  isDestroyed?: boolean;
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
  stateEffects?: Effect[];
  effects?: Effect[];
  dependencies?: Dependency[];
  reconcileState?: ReconcileState;
  memorizeState?: MemorizeState;
  runtime?: Runtime;
}

export const createFiber = (options: Partial<Fiber> = {}) =>
  Object.assign<Fiber, Fiber>(
    {
      id: undefined,
      parent: undefined,
      child: undefined,
      sibling: undefined,
      index: undefined,
      to: undefined,
      el: undefined,
      preElFiber: undefined,
      isSvg: undefined,
      isDestroyed: undefined,
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
      stateEffects: undefined,
      effects: undefined,
      dependencies: undefined,
      reconcileState: undefined,
      memorizeState: undefined,
    },
    options
  );

export const TEXT = Symbol("$$Text");
export const ELEMENT = Symbol("$$Element");
export const PORTAL = Symbol("$$Portal");
export const PROVIDER = Symbol("$$Provider");
export const COMPONENT = Symbol("$$Component");

export const isText = (fiber: Fiber) => fiber.type === TEXT;
export const isHostElement = (fiber: Fiber) => fiber.type === ELEMENT;
export const isElement = (fiber: Fiber) =>
  isHostElement(fiber) || isText(fiber);

export const isPortal = (fiber: Fiber) => fiber.type === PORTAL;
export const isProvider = (fiber: Fiber) => fiber.type === PROVIDER;
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

export const findEls = (fiber: Fiber, findInPortal = false) => {
  const els: FiberEl[] = [];
  isElement(fiber)
    ? els.push(fiber.el!)
    : isPortal(fiber) && !findInPortal
    ? false
    : fiber.children?.forEach((child) => {
        els.push(...findEls(child, findInPortal));
      });

  return els;
};

export const findLastElFiber = (fiber: Fiber): Fiber | undefined => {
  if (isElement(fiber)) {
    return fiber;
  } else if (isPortal(fiber)) {
    return undefined;
  } else {
    for (let i = 0; i < (fiber.children?.length ?? 0); i++) {
      const result = findLastElFiber(fiber.children!.at(-(i + 1))!);
      if (result) return result;
    }
  }
};

export type ContainerElement = Exclude<FiberEl, Text>;

export const getContainerElFiber = (
  fiber: Fiber | undefined
): Fiber | undefined => {
  while ((fiber = fiber?.parent)) {
    if (isPortal(fiber) || isElement(fiber)) return fiber;
  }
};

export const findToRoot = (
  fiber: Fiber | undefined,
  cb: (fiber: Fiber) => boolean
): Fiber | undefined => {
  while ((fiber = fiber?.parent)) {
    if (cb(fiber)) return fiber;
  }
};

export const findRoot = (fiber: Fiber) =>
  findToRoot(fiber, (fiber) => !fiber.parent)!;

export const findRuntime = (fiber: Fiber) =>
  fiber.reconcileState?.rootWorkingFiber
    ? fiber.reconcileState.rootWorkingFiber.runtime!
    : findRoot(fiber).runtime!;
