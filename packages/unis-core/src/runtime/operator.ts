import { Fiber, findEls, isPortal, isText } from "../fiber";
import { getEventName, isEvent, isNullish } from "../utils";

type FiberEl = Element | DocumentFragment | SVGAElement | Text;

export const createOperator = () => {
  const createDOMElement = (fiber: Fiber) => {
    const { tag: type, isSVG } = fiber;
    return isText(fiber)
      ? document.createTextNode(fiber.props.nodeValue + "")
      : isSVG
      ? document.createElementNS("http://www.w3.org/2000/svg", type as string)
      : document.createElement(type as string);
  };

  const insertBefore = (
    containerFiber: Fiber,
    insertElement: FiberEl,
    targetElement: FiberEl | null
  ) => {
    (isPortal(containerFiber)
      ? containerFiber.to
      : containerFiber.el)!.insertBefore(insertElement, targetElement);
  };

  const nextSibling = (fiber: Fiber) => fiber.el!.nextSibling as FiberEl | null;

  const firstChild = (fiber: Fiber) => fiber.el!.firstChild as FiberEl | null;

  const remove = (fiber: Fiber) => {
    const [first, ...rest] = findEls(fiber);
    const parentNode = first?.parentNode;
    if (parentNode) {
      for (const el of [first, ...rest]) {
        parentNode.removeChild(el);
      }
    }
  };

  const updateTextProperties = (fiber: Fiber) => {
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

  const updateElementProperties = (fiber: Fiber) => {
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

  return {
    createOperator,
    createDOMElement,
    insertBefore,
    nextSibling,
    firstChild,
    remove,
    updateTextProperties,
    updateElementProperties,
  };
};
