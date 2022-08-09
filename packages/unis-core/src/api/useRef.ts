export interface Ref<T> {
  current: T;
}

export function useRef<T>(): Ref<T | undefined>;
export function useRef<T>(value: T): Ref<T>;
export function useRef<T>(value?: T) {
  return { current: value };
}
