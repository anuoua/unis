import {
  classes,
  getEventName,
  isEv,
  isNullish,
  isStr,
  realSVGAttr,
  style2String,
} from "./utils";
import { Fiber, FiberEl, isElement, isPortal, isText } from "./fiber";
import { keys } from "./utils";

export const createFragment = () => document.createDocumentFragment();

export const createElement = (fiber: Fiber) => {
  const { type, isSVG } = fiber;
  const el = isText(fiber)
    ? document.createTextNode(fiber.props.nodeValue + "")
    : isSVG
    ? document.createElementNS("http://www.w3.org/2000/svg", type as string)
    : document.createElement(type as string);
  fiber.el = el;
  return el;
};

export type AttrDiff = [string, any, any][];

export const attrDiff = (
  newFiber: Record<string, any>,
  oldFiber: Record<string, any>
) => {
  const diff: AttrDiff = [];
  const newProps = newFiber.props;
  const oldProps = oldFiber.props;

  const getRealAttr = (attr: string) =>
    attr === "className"
      ? "class"
      : newFiber.isSVG
      ? realSVGAttr(attr)
      : attr.toLowerCase();

  const getRealValue = (newValue: any, key: string) => {
    if (isNullish(newValue)) return;
    switch (key) {
      case "className":
        return isStr(newValue) ? newValue : classes(newValue);
      case "style":
        return style2String(newValue as Partial<CSSStyleDeclaration>);
      default:
        return newValue;
    }
  };

  for (const key of new Set([...keys(newProps), ...keys(oldProps)])) {
    if (["xmlns", "children"].includes(key)) continue;
    const newValue = newProps[key];
    const oldValue = oldProps[key];
    const realNewValue = getRealValue(newValue, key);
    const realOldValue = getRealValue(oldValue, key);
    if (
      !isNullish(newValue) &&
      !isNullish(oldValue) &&
      realNewValue === realOldValue
    )
      continue;
    diff.push([getRealAttr(key), realNewValue, realOldValue]);
  }

  return diff;
};

export const updateElementProperties = (fiber: Fiber) => {
  let { el, isSVG, attrDiff: diff } = fiber;

  const setAttr = (el: FiberEl) =>
    isSVG
      ? (el as SVGAElement).setAttributeNS.bind(el, null)
      : (el as HTMLElement).setAttribute.bind(el);
  const removeAttr = (el: FiberEl) =>
    isSVG
      ? (el as SVGAElement).removeAttributeNS.bind(el, null)
      : (el as HTMLElement).removeAttribute.bind(el);

  for (const [key, newValue, oldValue] of diff || []) {
    const newExist = !isNullish(newValue);
    const oldExist = !isNullish(oldValue);
    if (key === "ref") {
      oldExist && (oldValue.current = undefined);
      newExist && (newValue.current = el);
    } else if (isEv(key)) {
      const eventName = getEventName(key);
      oldExist && el!.removeEventListener(eventName, oldValue);
      newExist && el!.addEventListener(eventName, newValue);
    } else {
      newExist ? setAttr(el!)(key, newValue) : removeAttr(el!)(key);
    }
  }
};

export const updateProperties = (fiber: Fiber) => {
  isText(fiber) ? updateTextProperties(fiber) : updateElementProperties(fiber);
};

export const updateTextProperties = (fiber: Fiber) => {
  fiber.el!.nodeValue = fiber.props.nodeValue + "";
};

export const remove = (fiber: Fiber) => {
  const els = findEls([fiber]);
  createFragment().append(...els);
};

export const findEls = (fibers: Fiber[]): FiberEl[] =>
  fibers.reduce(
    (pre, cur) =>
      pre.concat(
        isElement(cur)
          ? cur.el!
          : isPortal(cur)
          ? []
          : findEls(cur.children ?? [])
      ),
    [] as FiberEl[]
  );

export const getContainer = (
  fiber: Fiber | undefined
): [FiberEl | undefined, boolean] | undefined => {
  while ((fiber = fiber?.parent)) {
    if (fiber.to) return [fiber.to, true];
    if (fiber.el) return [fiber.el, false];
  }
};
