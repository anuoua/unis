import { isNum, isStr } from "./utils";
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

export function h2(type: any, props: any, key?: string | number) {
  if (key !== undefined) props.key = key;
  return {
    type,
    props,
  } as Fiber;
}

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

export const createPortal = (child: any, container: Element) => {
  return {
    type: PORTAL,
    to: container,
    props: {
      children: child,
    },
  } as Fiber;
};

const defaultCompare = (newProps: any = {}, oldProps: any = {}) => {
  const newKeys = Object.keys(newProps);
  const oldKeys = Object.keys(oldProps);
  if (newKeys.length !== oldKeys.length) return false;
  return newKeys.every((key) => Object.is(newProps[key], oldProps[key]));
};

export const memo = (child: any, compare: Function = defaultCompare) => {
  return (props: any) =>
    ({
      type: MEMO,
      props: {
        children: {
          type: child,
          props,
        },
      },
      compare,
    } as Fiber);
};

export const Fragment = (props: any) => props.children;
