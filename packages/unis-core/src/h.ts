import { isNum, isStr, keys } from "./utils";
import { Fiber, MEMO, PORTAL, TEXT } from "./fiber";

export const h = (type: any, props: any, ...children: any[]) => {
  props = { ...props };
  if (children.length === 1) props.children = children[0];
  if (children.length > 1) props.children = children;
  return {
    type,
    props,
  } as Fiber;
};

export const h2 = (type: any, props: any, key?: string | number) => {
  if (key !== undefined) props.key = key;
  return {
    type,
    props,
  } as Fiber;
};

export const formatChildren = (children: any) => {
  children = [].concat(children);
  return children.reduce(
    (pre: any, cur: any) =>
      [null, false, true, undefined].includes(cur)
        ? pre
        : pre.concat(
            isStr(cur) || isNum(cur)
              ? { type: TEXT, props: { nodeValue: cur } }
              : cur
          ),
    []
  );
};

export const createPortal = (child: JSX.Element, container: Element) => {
  return {
    type: PORTAL,
    to: container,
    props: {
      children: child,
    },
  } as Fiber;
};

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
  return function memo(
    props: Parameters<T>[0] extends undefined ? {} : Parameters<T>[0]
  ) {
    return {
      type: MEMO,
      props: {
        children: {
          type: child,
          props,
        },
      },
      compare,
    } as Fiber;
  };
};

export const Fragment = (props: any) => props.children;
