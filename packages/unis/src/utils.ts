import { displayAttrs } from "./svg";

export const keys = Object.keys;

export const isArray = Array.isArray;
export const isEv = (a: string) => a.startsWith("on");
export const isFun = (a: any): a is Function => typeof a === "function";
export const isStr = (a: any): a is string => typeof a === "string";
export const isNum = (a: any): a is number => typeof a === "number";
export const isObj = (a: any): a is object => {
  const type = typeof a;
  return (type === "object" || type === "function") && a !== null;
};

export const camel2kebab = (text: string) => {
  return text.replace(/([A-Z])/g, "-$1").toLowerCase();
};

export const getEventName = (event: string) => {
  return event.slice(2).toLowerCase();
};

export const arraysEqual = (a: any, b: any) => {
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
};

export const style2String = (style: CSSStyleDeclaration) => {
  const temp = document.createElement("div");
  Object.assign(temp.style, style);
  return temp.style.cssText;
};

export const realSVGAttr = (key: string) => {
  for (let str of ["xmlns", "xml", "xlink"]) {
    if (key.startsWith(str)) return key.toLowerCase().replace(str, `${str}:`);
  }
  return displayAttrs.includes(key) ? camel2kebab(key) : key;
};

export const classes = (
  cs: Array<string | number | undefined | null | false | object> | object
) => {
  const obj2Str = (a: object) =>
    keys(a).reduce((pre, cur) => (pre + cur ? ` ${cur}` : ""), "");

  return isArray(cs)
    ? cs.reduce(
        (pre, cur) =>
          pre +
          `${cur ? " " + (isNum(cur) || isStr(cur) ? cur : obj2Str(cur)) : ""}`,
        ""
      )
    : obj2Str(cs);
};
