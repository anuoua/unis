import { isNum, isStr, keys, toArray } from "./utils";
import { COMPONENT, createFiber, ELEMENT, Fiber, PORTAL, TEXT } from "./fiber";

export const h = (tag: any, props: any, ...children: any[]) => {
  props = { ...props };
  if (children.length === 1) props.children = children[0];
  if (children.length > 1) props.children = children;
  return createFiber({
    tag,
    type: isStr(tag) ? ELEMENT : COMPONENT,
    props,
    ...tag.take,
  });
};

export const h2 = (tag: any, props: any, key?: string | number) => {
  if (key !== undefined) props.key = key;
  return createFiber({
    tag,
    type: isStr(tag) ? ELEMENT : COMPONENT,
    props,
    ...tag.take,
  });
};

export const formatChildren = (children: any) => {
  const formatedChildren: Fiber[] = [];

  for (let child of toArray(children)) {
    if ([null, false, true, undefined].includes(child)) {
      continue;
    } else {
      Array.isArray(child)
        ? formatedChildren.push(...formatChildren(child))
        : formatedChildren.push(
            isStr(child) || isNum(child)
              ? createFiber({
                  type: TEXT,
                  props: { nodeValue: child },
                })
              : child
          );
    }
  }

  return formatedChildren;
};

export const createRoot = (element: any, container: Element): Fiber => {
  return {
    tag: container.tagName.toLocaleLowerCase(),
    type: ELEMENT,
    el: container,
    index: 0,
    props: {
      children: toArray(element),
    },
  };
};

export const createPortal = (child: JSX.Element, container: Element) =>
  createFiber({
    type: PORTAL,
    props: { children: child },
    to: container,
  });

const defaultCompare = (newProps: any = {}, oldProps: any = {}) => {
  const newKeys = keys(newProps);
  const oldKeys = keys(oldProps);
  if (newKeys.length !== oldKeys.length) return false;
  return newKeys.every((key) => Object.is(newProps[key], oldProps[key]));
};

export const memo = <
  T extends ((props: any) => JSX.Element) & { compare?: Function }
>(
  child: T,
  compare: Function = defaultCompare
) => {
  child.compare = compare;
  return child;
};

export const cloneElement = (
  element: Fiber,
  props = {},
  ...children: JSX.Element[]
) => h(element.tag, { ...props, ...props }, ...children);

export const createElement = h;

export const Fragment = (props: any) => props.children;

export const FGMT = Fragment;
