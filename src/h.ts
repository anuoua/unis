import { isStr, isNum, isFun } from "./utils";
import {
  ComponentVode,
  ElementVode,
  FragmentVode,
  TextVode,
  TeleportVode,
} from "./vode";

/* istanbul ignore next */
export const Fragment = (props: { children?: any }): any => {};

/* istanbul ignore next */
export const Teleport = (props: { children: any; to: HTMLElement }): any => {};

export const h = (
  type: any,
  { children = [], ...props },
  key?: string | number
) => {
  children = formatChildren(children);
  key !== undefined && (props.key = key);
  if (type === Fragment) {
    return new FragmentVode(props, children);
  } else if (type === Teleport) {
    return new TeleportVode(props as any, children);
  } else if (isFun(type)) {
    return new ComponentVode(type, props, children);
  } else if (isStr(type)) {
    return new ElementVode(type, props, children);
  }
};

export const formatChildren = (children: any) => {
  children = Array.isArray(children) ? children : [children];
  return children
    .reduce((p: any, c: any) => p.concat(Array.isArray(c) ? c : [c]), [])
    .filter((i: any) => ![null, false, true, undefined].includes(i))
    .map((i: any) =>
      isStr(i) || isNum(i) ? new TextVode({ nodeValue: i }) : i
    );
};
