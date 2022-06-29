import { isNum, isStr, keys } from "./utils";
import {
  COMPONENT,
  createFiber,
  ELEMENT,
  Fiber,
  MEMO,
  PORTAL,
  TEXT,
} from "./fiber";

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
  const formatChildren: Fiber[] = [];

  for (let child of [].concat(children)) {
    if ([null, false, true, undefined].includes(child)) {
      continue;
    } else {
      formatChildren.push(
        isStr(child) || isNum(child)
          ? createFiber({
              type: TEXT,
              props: { nodeValue: child },
            })
          : child
      );
    }
  }

  return formatChildren;
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

export const memo = <T extends (props: any) => JSX.Element>(
  child: T,
  compare: Function = defaultCompare
) => {
  const memo = (
    props: Parameters<T>[0] extends undefined ? {} : Parameters<T>[0]
  ) =>
    createFiber({
      tag: child,
      type: COMPONENT,
      props,
    });

  memo.take = {
    compare,
    type: MEMO,
  } as Fiber;

  return memo;
};

export const Fragment = (props: any) => props.children;
