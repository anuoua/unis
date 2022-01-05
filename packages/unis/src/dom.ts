import { camel2kebab, classes, getEventName, isEv } from "./utils";

export function createTextNode(nodeValue: string) {
  return document.createTextNode(nodeValue);
}

export function createFragment() {
  return document.createDocumentFragment();
}

export function updateTextNode(el: Text, oldProps: any, newProps: any) {
  if (oldProps.nodeValue !== newProps.nodeValue) {
    el.nodeValue = newProps.nodeValue;
  }
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
  el: Element,
  oldProps: any,
  newProps: any,
  isSVG: boolean
) {
  const { class: klass, className } = newProps;
  if (klass || className) {
    const classStr = ((className ?? "") + " " + classes(klass)).trim();
    if (isSVG) {
      (el as SVGAElement).setAttributeNS(null, "class", classStr);
    } else {
      (el as HTMLElement).className = classStr;
    }
  }

  for (const key of [...Object.keys({ ...oldProps, ...newProps })]) {
    if (
      key === "ref" ||
      key === "xmlns" ||
      key === "className" ||
      key === "class"
    )
      continue;
    if (isEv(key)) {
      el.removeEventListener(getEventName(key), oldProps[key]);
      el.addEventListener(getEventName(key), newProps[key]);
    } else if (key === "style") {
      const temp = createElement("div");
      Object.assign(temp.style, newProps.style);
      (el as HTMLElement).style.cssText = temp.style.cssText;
    } else {
      if (oldProps.hasOwnProperty(key) && !newProps.hasOwnProperty(key)) {
        el.removeAttribute(key);
      } else {
        isSVG
          ? el.setAttributeNS(null, camel2kebab(key), newProps[key])
          : el.setAttribute(key.toLowerCase(), newProps[key]);
      }
    }
  }
}

export function insertBefore(
  parentEl: Node,
  newEls: Node[],
  targetEl: Node | null = null
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

export function append(el: Element | DocumentFragment, ...els: Node[]) {
  return el.append(...els);
}

export function prepend(el: Element | DocumentFragment, ...els: Node[]) {
  return el.prepend(...els);
}

export function removeElements(children: Array<Node | Text>) {
  const fg = createFragment();
  fg.append(...children);
}
