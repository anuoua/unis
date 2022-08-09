export * from "./use";
export * from "./useEffect";
export * from "./useFlush";
export * from "./useId";
export * from "./useLayoutEffect";
export * from "./useProps";
export * from "./useReducer";
export * from "./useRef";
export * from "./useState";

import { Fiber, FLAG, mergeFlag } from "../fiber";
import { getWorkingFiber } from "../reconcile";
import { arraysEqual } from "../utils";

export type Effect = (() => (() => void) | void) & {
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

export const clearEffects = (effects?: Effect[]) => {
  if (!effects) return;
  for (const effect of effects) {
    effect.clear?.();
  }
};

export const runEffects = (effects?: Effect[]) => {
  if (!effects) return;
  for (const effect of effects) {
    const deps = effect.depsFn?.();
    const equal = arraysEqual(deps, effect.deps);
    effect.deps = deps;
    if (equal) continue;
    effect.clear = effect();
  }
};
