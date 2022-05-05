import { Effect } from "./api";
import { Dependency } from "./context";
import { AttrDiff } from "./dom";

export enum FLAG {
  CREATE = 1,
  INSERT,
  UPDATE,
  DELETE,
  REUSE,
}

export type FiberEl = Element | Text | DocumentFragment | SVGAElement;

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
  type?: string | Function | Symbol | ((...p: any[]) => () => any);
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
}

export const TEXT = "$$Text";
export const PORTAL = Symbol("$$Portal");
export const MEMO = Symbol("$$Memo");
export const CONTEXT = Symbol("$$Context");

export const isText = (fiber: Fiber) => fiber.type === TEXT;
export const isPortal = (fiber: Fiber) => fiber.type === PORTAL;
export const isMemo = (fiber: Fiber) => fiber.type === MEMO;
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
