import { getEventName, isEv, isRef } from "./utils";

export function createTextNode(nodeValue: string) {
  return document.createTextNode(nodeValue);
}

export function createFragment() {
  return document.createDocumentFragment();
}

export function createElement(type: string, props?: any, isSVG = false) {
  const el = isSVG
    ? document.createElementNS("http://www.w3.org/2000/svg", type)
    : document.createElement(type);
  if (!props) return el;
  updateElementProperties(el, {}, props, isSVG);
  return el;
}

export function updateElementProperties(
  el: HTMLElement | SVGElement,
  oldProps: any,
  newProps: any,
  isSVG: boolean
) {
  for (const key of [...Object.keys({ ...oldProps, ...newProps })]) {
    if (isRef(key)) continue;
    if (isEv(key)) {
      el.removeEventListener(getEventName(key), oldProps[key]);
      el.addEventListener(getEventName(key), newProps[key]);
    } else if (key === "style") {
      const temp = createElement("div");
      Object.assign(temp.style, newProps.style);
      el.style.cssText = temp.style.cssText;
    } else if (key === "className") {
      (el as HTMLElement).className = newProps[key];
    } else {
      if (oldProps.hasOwnProperty(key) && !newProps.hasOwnProperty(key)) {
        el.removeAttribute(key);
      } else {
        isSVG
          ? el.setAttributeNS(null, key, newProps[key])
          : el.setAttribute(key, newProps[key]);
      }
    }
  }
}

export function insertBefore(
  parentEl: Node,
  newEls: Node[],
  targetEl: Node | null
) {
  let insertEl: any;
  if (newEls.length === 1) {
    insertEl = newEls[0];
  } else {
    insertEl = createFragment();
    insertEl.append(...newEls);
  }
  parentEl.insertBefore(insertEl, targetEl);
}

export function nextSibline(el?: Node) {
  return el ? el.nextSibling : null;
}

export function append(
  el: HTMLElement | DocumentFragment | SVGElement,
  ...els: Node[]
) {
  return el.append(...els);
}

export function removeElements(children: Node[]) {
  const fg = createFragment();
  fg.append(...children);
}
