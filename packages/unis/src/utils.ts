import { Fiber } from "./fiber";
import { displayAttrs } from "./svg";

export const keys = Object.keys;

export const isEv = (a: string) => a.startsWith("on");
export const isFun = (a: any): a is Function => typeof a === "function";
export const isStr = (a: any): a is string => typeof a === "string";
export const isNum = (a: any) => typeof a === "number";

export const isSame = (fiber1?: Fiber, fiber2?: Fiber) => {
  return (
    fiber1 &&
    fiber2 &&
    fiber1.type === fiber2.type &&
    fiber1.props?.key === fiber2.props?.key
  );
};

export function camel2kebab(text: string) {
  return text.replace(/([A-Z])/g, "-$1").toLowerCase();
}

export function getEventName(event: string) {
  return event.slice(2).toLowerCase();
}

export const arraysEqual = (a: any, b: any) => {
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
};

export function isObj(a: any) {
  const type = typeof a;
  return (type === "object" || type === "function") && a !== null;
}

export function realSVGAttr(key: string) {
  for (let str of ["xmlns", "xml", "xlink"]) {
    if (key.startsWith(str)) return key.toLowerCase().replace(str, `${str}:`);
  }
  if (displayAttrs.includes(key)) {
    return camel2kebab(key);
  } else {
    return key;
  }
}

export function classes(
  cs: Array<string | number | undefined | null | boolean> | string | {}
) {
  const obj2Str = (a: any) =>
    Object.keys(a)
      .filter((i) => a[i])
      .join(" ");
  if (Array.isArray(cs)) {
    return cs
      .map((i) => {
        if (isNum(i) || isStr(i)) {
          return i;
        } else if (isObj(i)) {
          return obj2Str(i);
        } else {
          return null;
        }
      })
      .filter((i) => i)
      .join(" ");
  } else if (isObj(cs)) {
    return obj2Str(cs);
  } else if (isStr(cs)) {
    return cs;
  } else {
    return "";
  }
}
