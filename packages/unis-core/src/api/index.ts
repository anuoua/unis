export * from "./use";
export * from "./useEffect";
export * from "./useId";
export * from "./useLayoutEffect";
export * from "./useProps";
export * from "./useReducer";
export * from "./useRef";
export * from "./useState";
export * from "./useMemo";

import { Fiber, FLAG, mergeFlag } from "../fiber";
import { getWorkingFiber } from "../reconcile";
import { arraysEqual } from "../utils";

export enum EFFECT_TYPE {
  LAYOUT = "layout",
  TICK = "tick",
}

export type Effect = (() => (() => void) | void) & {
  type?: EFFECT_TYPE;
  clear?: (() => void) | void;
  depsFn?: () => any;
  deps?: any;
};

export const getWF = (): Fiber | never => {
  const workingFiber = getWorkingFiber();
  if (workingFiber) {
    return workingFiber;
  } else {
    throw Error("Do not call use function outside of component");
  }
};

export const markFiber = (workingFiber: Fiber) => {
  workingFiber.flag = mergeFlag(workingFiber.flag, FLAG.UPDATE);

  let indexFiber: Fiber | undefined = workingFiber;

  while ((indexFiber = indexFiber.parent)) {
    if (indexFiber.childFlag) break;
    indexFiber.childFlag = mergeFlag(indexFiber.childFlag, FLAG.UPDATE);
  }
};

export const runStateEffects = (fiber: Fiber) => {
  for (let effect of fiber.stateEffects ?? []) {
    effect();
  }
};

export const effectDepsEqual = (effect: Effect) => {
  const deps = effect.depsFn?.();
  const equal = arraysEqual(deps, effect.deps);
  effect.deps = deps;
  return equal;
};

export const clearEffects = (effects?: Effect[]) => {
  if (!effects) return;
  for (const effect of effects) {
    effect.clear?.();
  }
};

export const runEffects = (effects?: Effect[]) => {
  if (!effects) return;
  for (const effect of effects) {
    effect.clear = effect();
  }
};

export const clearAndRunEffects = (effects?: Effect[]) => {
  if (!effects) return;
  for (const effect of effects) {
    if (effectDepsEqual(effect)) continue;
    effect.clear?.();
    effect.clear = effect();
  }
};

export const unisFns = {
  use: 1,
  useState: 1,
  useProps: 1,
  useContext: 1,
  useReducer: 2,
  useMemo: 2,
};
