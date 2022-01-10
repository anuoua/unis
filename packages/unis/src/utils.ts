import { displayAttrs } from "./svg";
import { Vode } from "./vode";

export function isEv(a: string) {
  return a.startsWith("on");
}

export function isFun(a: any): a is Function {
  return typeof a === "function";
}

export function isStr(a: any): a is string {
  return typeof a === "string";
}

export function isNum(a: any) {
  return typeof a === "number";
}

export function camel2kebab(text: string) {
  return text.replace(/([A-Z])/g, "-$1").toLowerCase();
}

export function getEventName(event: string) {
  return event.slice(2).toLowerCase();
}

export function isSameVode(a: Vode, b: Vode) {
  return a.type === b.type && a.props?.key === b.props?.key;
}

export function rEach<T extends any>(arr: T[], callback: (a: T) => unknown) {
  const length = arr.length;
  for (let i = 0; i < length; i++) {
    callback(arr[length - 1 - i]);
  }
}

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
