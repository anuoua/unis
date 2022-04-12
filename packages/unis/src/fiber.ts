import { Effect } from "./api";
import { ContextItem } from "./context";

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
  dependencies?: ContextItem[];
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
