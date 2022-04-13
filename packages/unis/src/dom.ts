import { classes, getEventName, isEv, realSVGAttr } from "./utils";
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

export const attrsChanged = (newProps: any = {}, oldProps: any = {}) => {
  const { children: c1, ...restNewProps } = newProps;
  const { children: c2, ...restOldProps } = oldProps;
  const newKeys = Object.keys(restNewProps);
  const oldKeys = Object.keys(restOldProps);
  if (newKeys.length !== oldKeys.length) return false;
  return !!newKeys.find((key) => restOldProps[key] !== restNewProps[key]);
};

export const updateProperties = (fiber: Fiber) => {
  isText(fiber) ? updateTextProperties(fiber) : updateElementProperties(fiber);
};

export const updateTextProperties = (fiber: Fiber) => {
  fiber.el!.nodeValue = fiber.props.nodeValue + "";
};

export const updateElementProperties = (fiber: Fiber) => {
  let { props, el, isSVG } = fiber;
  const preProps = fiber.alternate?.props ?? {};
  const { class: klass, className } = props;

  if (klass || className) {
    const classStr = ((className ?? "") + " " + classes(klass)).trim();
    if (isSVG) {
      (el as SVGAElement).setAttributeNS(null, "class", classStr);
    } else {
      (el as HTMLElement).className = classStr;
    }
  }

  el = el as Element;

  for (const key of new Set(keys(props).concat(keys(preProps)))) {
    if (key === "ref") {
      preProps.ref && (preProps.ref.current = undefined);
      props.ref && (props.ref.current = el);
      continue;
    }
    if (
      key === "xmlns" ||
      key === "className" ||
      key === "class" ||
      key === "children"
    )
      continue;
    if (isEv(key)) {
      el.removeEventListener(getEventName(key), preProps[key]);
      el.addEventListener(getEventName(key), props[key]);
    } else if (key === "style") {
      const temp = document.createElement("div");
      Object.assign(temp.style, props.style);
      (el as HTMLElement).style.cssText = temp.style.cssText;
    } else {
      if (key in preProps && !(key in props)) {
        el.removeAttribute(key);
      } else {
        isSVG
          ? el.setAttributeNS(null, realSVGAttr(key), props[key])
          : el.setAttribute(key.toLowerCase(), props[key]);
      }
    }
  }
};

export const remove = (fiber: Fiber) => {
  const els = findEls([fiber]);
  createFragment().append(...els);
  fiber.props.ref && (fiber.props.ref.current = undefined);
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
