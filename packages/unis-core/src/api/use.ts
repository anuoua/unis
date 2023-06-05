import { getWF } from "./utils";

export function use<T extends (...args: any[]) => any>(fn: T): ReturnType<T>;
export function use<T extends (...args: any[]) => any>(
  fn: T,
  raFn: Function
): ReturnType<T>;
export function use<T extends (...args: any[]) => any>(fn: T, raFn?: Function) {
  const workingFiber = getWF();
  const effect = () => {
    const result = fn(getWF());
    return raFn?.(result);
  };
  workingFiber.stateEffects?.push(effect) ??
    (workingFiber.stateEffects = [effect]);
  return fn(workingFiber) as ReturnType<T>;
}
