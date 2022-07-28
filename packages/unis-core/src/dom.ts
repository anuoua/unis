import { getEventName, isEvent, isNullish } from "./utils";
import { Fiber, FiberEl, findEls, isText } from "./fiber";
import { readyForWork } from "./reconcile";

export const render = (element: any, container: Element) => {
  readyForWork({
    tag: container.tagName.toLocaleLowerCase(),
    el: container,
    index: 0,
    props: {
      children: [].concat(element),
    },
  });
};

export const createFragment = () => document.createDocumentFragment();

export const createElement = (fiber: Fiber) => {
  const { tag: type, isSVG } = fiber;
  return isText(fiber)
    ? document.createTextNode(fiber.props.nodeValue + "")
    : isSVG
    ? document.createElementNS("http://www.w3.org/2000/svg", type as string)
    : document.createElement(type as string);
};

export const insertBefore = (container: Node, node: Node, child: Node | null) =>
  container.insertBefore(node, child);

export const append = (
  container: Element | DocumentFragment,
  ...nodes: (DocumentFragment | Element | Text)[]
) => container.append(...nodes);

export const nextSibling = (node: Node) => node.nextSibling;

export const firstChild = (node: Node) => node.firstChild;

export const remove = (fiber: Fiber) =>
  createFragment().append(...findEls([fiber]));

export const updateTextProperties = (fiber: Fiber) => {
  fiber.el!.nodeValue = fiber.props.nodeValue + "";
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
    } else if (isEvent(key)) {
      const eventName = getEventName(key);
      oldExist && el!.removeEventListener(eventName, oldValue);
      newExist && el!.addEventListener(eventName, newValue);
    } else {
      newExist ? setAttr(el!)(key, newValue) : removeAttr(el!)(key);
    }
  }
};
