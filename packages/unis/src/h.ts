import { isStr, isNum, isFun } from "./utils";
import {
  ComponentVode,
  ElementVode,
  FragmentVode,
  TextVode,
  TeleportVode,
} from "./vode";

/* istanbul ignore next */
export function Fragment(props: { children?: any }): any {}

/* istanbul ignore next */
export function Teleport(props: { children: any; to: Element }): any {}

export function h(type: any, props: any, ...children: any[]) {
  props = props ?? {};
  children = formatChildren(children);
  if (type === Fragment) {
    return new FragmentVode(props, children);
  } else if (type === Teleport) {
    return new TeleportVode(props, children);
  } else if (isFun(type)) {
    return new ComponentVode(type, props, children);
  } else if (isStr(type)) {
    return new ElementVode(type, props, children);
  }
}

export function h2(
  type: any,
  { children = [], ...props }: any,
  key?: string | number
) {
  key !== undefined && (props.key = key);
  return h(type, props, ...[].concat(children));
}

export function formatChildren(children: any) {
  children = [].concat(children);
  return children
    .reduce((p: any, c: any) => p.concat(Array.isArray(c) ? c : [c]), [])
    .filter((i: any) => ![null, false, true, undefined].includes(i))
    .map((i: any) =>
      isStr(i) || isNum(i) ? new TextVode({ nodeValue: i }) : i
    );
}
