import { computed, isRef, Ref } from "@vue/reactivity";

export type Remove<T> = {
  [K in keyof T]-?: T[K];
};

export type Extract<T> = {
  [K in keyof Remove<T>]: T[K] extends undefined | Function ? T[K] : Ref<T[K]>;
};

export function extract<T extends { [index: string]: any }>(props: T) {
  const obj: any = {};
  Object.keys(props).forEach((key) => {
    obj[key] =
      typeof props[key] === "function"
        ? (...rest: any[]) => props[key](...rest)
        : computed(() => props[key]);
  });
  return obj as Extract<T>;
}

export function $<T>(a: T) {
  return (isRef(a) ? a.value : a) as T extends Ref ? T["value"] : T;
}
