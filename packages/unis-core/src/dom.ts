import { getEventName, isEvent, isNullish, toArray } from "./utils";
import { ELEMENT, Fiber, FiberEl, findEls, isPortal, isText } from "./fiber";
import { readyForWork } from "./reconcile";

export const render = (element: any, container: Element) => {
  readyForWork({
    tag: container.tagName.toLocaleLowerCase(),
    type: ELEMENT,
    el: container,
    index: 0,
    props: {
      children: toArray(element),
    },
  });
};

export const createDOMElement = (fiber: Fiber) => {
  const { tag: type, isSVG } = fiber;
  return isText(fiber)
    ? document.createTextNode(fiber.props.nodeValue + "")
    : isSVG
    ? document.createElementNS("http://www.w3.org/2000/svg", type as string)
    : document.createElement(type as string);
};

export const insertBefore = (
  containerFiber: Fiber,
  insertElement: FiberEl,
  targetElement: FiberEl | null
) => {
  (isPortal(containerFiber)
    ? containerFiber.to
    : containerFiber.el)!.insertBefore(insertElement, targetElement);
};

export const nextSibling = (fiber: Fiber) =>
  fiber.el!.nextSibling as FiberEl | null;

export const firstChild = (fiber: Fiber) =>
  fiber.el!.firstChild as FiberEl | null;

export const remove = (fiber: Fiber) => {
  const [first, ...rest] = findEls(fiber);
  const parentNode = first?.parentNode;
  if (parentNode) {
    for (const el of [first, ...rest]) {
      parentNode.removeChild(el);
    }
  }
};

export const updateTextProperties = (fiber: Fiber) => {
  fiber.el!.nodeValue = fiber.props.nodeValue + "";
};

const setAttr = (
  el: SVGAElement | HTMLElement,
  isSVG: boolean,
  key: string,
  value: string
) =>
  isSVG
    ? (el as SVGAElement).setAttributeNS(null, key, value)
    : (el as HTMLElement).setAttribute(key, value);

const removeAttr = (
  el: SVGAElement | HTMLElement,
  isSVG: boolean,
  key: string
) =>
  isSVG
    ? (el as SVGAElement).removeAttributeNS(null, key)
    : (el as HTMLElement).removeAttribute(key);

export const updateElementProperties = (fiber: Fiber) => {
  let { el, isSVG, attrDiff: diff } = fiber;

  for (const [key, newValue, oldValue] of diff || []) {
    const newExist = !isNullish(newValue);
    const oldExist = !isNullish(oldValue);
    if (key === "ref") {
      oldExist && (oldValue.current = undefined);
      newExist && (newValue.current = el);
    } else if (isEvent(key)) {
      const [eventName, capture] = getEventName(key);
      oldExist && el!.removeEventListener(eventName, oldValue);
      newExist && el!.addEventListener(eventName, newValue, capture);
    } else {
      newExist
        ? setAttr(el as SVGAElement | HTMLElement, isSVG!, key, newValue)
        : removeAttr(el as SVGAElement | HTMLElement, isSVG!, key);
    }
  }
};
