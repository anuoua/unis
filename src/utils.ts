import { Vode } from "./type";

export function isEv(a: string) {
  return a.startsWith("on");
}

export function isRef(a: string) {
  return a === "ref";
}

export const isFun = (a: any): a is Function => {
  return typeof a === "function";
};

export const isStr = (a: any): a is string => {
  return typeof a === "string";
};

export const isNum = (a: any) => {
  return typeof a === "number";
};

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
