import {
  classes,
  getEventName,
  isEv,
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

export const attrsChanged = (newProps: any = {}, oldProps: any = {}) => {
  const { children: c1, ...restNewProps } = newProps;
  const { children: c2, ...restOldProps } = oldProps;
  const newKeys = keys(restNewProps);
  const oldKeys = keys(restOldProps);
  if (newKeys.length !== oldKeys.length) return true;
  return !!newKeys.find(
    (key) => !Object.is(restOldProps[key], restNewProps[key])
  );
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

  const setAttr = (el: FiberEl, isSVG: boolean) =>
    isSVG
      ? (el as SVGAElement).setAttributeNS.bind(el, null)
      : (el as HTMLElement).setAttribute.bind(el);
  const removeAttr = (el: FiberEl, isSVG: boolean) =>
    isSVG
      ? (el as SVGAElement).removeAttributeNS.bind(el, null)
      : (el as HTMLElement).removeAttribute.bind(el);

  if (klass || className) {
    const classStr = (className + " " + (klass ? classes(klass) : "")).trim();
    setAttr(el!, !!isSVG)("class", classStr);
  } else {
    removeAttr(el!, !!isSVG)("class");
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
      (el as HTMLElement).style.cssText = style2String(props.style);
    } else {
      if (key in preProps && !(key in props)) {
        removeAttr(el!, !!isSVG)(key);
      } else {
        setAttr(el!, !!isSVG)(
          isSVG ? realSVGAttr(key) : key.toLowerCase(),
          props[key]
        );
      }
    }
  }
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
