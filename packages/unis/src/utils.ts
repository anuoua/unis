import { displayAttrs } from "./svg";

export const keys = Object.keys;

export const isArray = Array.isArray;

export const type = (a: any) =>
  Object.prototype.toString.bind(a)().slice(8, -1);

export const isEv = (a: string) => a.startsWith("on");
export const isFun = (a: any): a is Function => type(a) === "Function";
export const isStr = (a: any): a is string => type(a) === "String";
export const isNum = (a: any): a is number => type(a) === "Number";
export const isBool = (a: any): a is boolean => type(a) === "Boolean";
export const isObj = (a: any): a is object => type(a) === "Object";
export const isNullish = (a: any) => a == null;

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

export const style2String = (style: Partial<CSSStyleDeclaration>) => {
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

export type CSValue = string | number | boolean | undefined | null;

export type CSObject = Record<string, CSValue>;

export type CSArray = (CSValue | CSObject | CSArray)[];

export const classes = (cs: CSArray | CSObject): string => {
  const objClasses = (a: Record<string, any>) =>
    keys(a)
      .reduce((pre, cur) => pre + " " + (a[cur] ? cur : ""), "")
      .trim();

  return isArray(cs)
    ? cs
        .reduce(
          (pre: string, cur) =>
            pre +
            " " +
            `${
              isNum(cur) || isStr(cur)
                ? cur
                : isObj(cur)
                ? objClasses(cur)
                : isArray(cur)
                ? classes(cur)
                : ""
            }`,
          ""
        )
        .trim()
    : objClasses(cs);
};
