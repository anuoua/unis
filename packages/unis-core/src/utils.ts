import type { CSArray, CSObject } from "../types/jsx";
import { displayAttrs } from "./svg";

export const keys = Object.keys;

export const type = (a: any) =>
  Object.prototype.toString.bind(a)().slice(8, -1);

export const isFun = (a: any): a is Function => typeof a === "function";
export const isStr = (a: any): a is string => typeof a === "string";
export const isNum = (a: any): a is number => typeof a === "number";
export const isBool = (a: any): a is boolean => typeof a === "boolean";
export const isSymbol = (a: any): a is boolean => typeof a === "symbol";

export const isArray = Array.isArray;
export const isObject = (a: any): a is object => type(a) === "Object";

export const isNullish = (a: any): a is null | undefined => a == null;

export const isEvent = (a: string) => a.startsWith("on");
export const getEventName = (event: string) => {
  const [, eventName, capture] = event.match(/^on(.*)(Capture)?$/)!;
  return [eventName.toLowerCase(), !!capture] as const;
};

export const camel2kebab = (text: string) =>
  text.replace(/([A-Z])/g, "-$1").toLowerCase();

export const toArray = <T extends any>(a: T) => (Array.isArray(a) ? a : [a]);

export const arraysEqual = (a: any, b: any) => {
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
};

export const styleStr = (style: Partial<CSSStyleDeclaration>) =>
  keys(style)
    .map(
      (key) => `${camel2kebab(key)}: ${style[key as keyof CSSStyleDeclaration]}`
    )
    .join("; ") + ";";

export const svgKey = (key: string) => {
  for (const str of ["xmlns", "xml", "xlink"]) {
    if (key.startsWith(str)) return key.toLowerCase().replace(str, `${str}:`);
  }
  return displayAttrs.includes(key) ? camel2kebab(key) : key;
};

export const classes = (cs: CSArray | CSObject): string => {
  const objectClasses = (objcs: Record<string, any>) =>
    keys(objcs)
      .reduce((pre, cur) => pre + " " + (objcs[cur] ? cur : ""), "")
      .trim();

  const arrayClasses = (arrcs: CSArray) =>
    arrcs
      .reduce(
        (pre: string, cur) =>
          pre +
          " " +
          `${
            isNum(cur) || isStr(cur)
              ? cur
              : isObject(cur)
              ? objectClasses(cur)
              : isArray(cur)
              ? classes(cur)
              : ""
          }`,
        ""
      )
      .trim();

  return isArray(cs) ? arrayClasses(cs) : objectClasses(cs);
};

let overflow = "";
let count = 0;

export const generateId = () => {
  if (count === Number.MAX_SAFE_INTEGER) {
    overflow += count.toString(32);
    count = 0;
  }
  return `${overflow}${(count++).toString(32)}`;
};
