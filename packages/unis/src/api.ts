import { Fiber, FLAG } from "./fiber";
import { getWorkingFiber } from "./reconcile";
import { triggerDebounce } from "./schedule";
import { arraysEqual } from "./utils";

export interface Ref<T> {
  current: T;
}

export type Effect = (() => (() => void) | void) & {
  clear?: (() => void) | void;
  depsFn?: () => any;
  deps?: any;
};

export type Reducer<T, T2> = (state: T, action: T2) => T;

export const getWF = (): Fiber | never => {
  const workingFiber = getWorkingFiber();
  if (workingFiber) {
    return workingFiber;
  } else {
    throw Error("Do not call use function outside of component");
  }
};

export const markFiber = (workingFiber: Fiber) => {
  workingFiber.flag = FLAG.UPDATE;

  let indexFiber: Fiber | undefined = workingFiber;
  while ((indexFiber = indexFiber.parent)) {
    if (indexFiber.childFlag) break;
    indexFiber.childFlag = FLAG.UPDATE;
  }
};

export const reducerHOF = <T extends any, T2 extends any>(
  reducerFn: Reducer<T, T2>,
  initial: T
) => {
  let state = initial;
  let workingFiber: Fiber;

  const dispatch = (action: T2) => {
    state = reducerFn(state, action);
    markFiber(workingFiber);
    triggerDebounce(workingFiber);
  };

  return (WF: Fiber) => {
    workingFiber = WF;
    return [state, dispatch] as [T, typeof dispatch];
  };
};

export const stateHOF = <T extends any>(initial: T) => {
  return reducerHOF<T, T>((preState, action) => action, initial);
};

export const propsHOF = <T>(props: T) => {
  return (WF: Fiber) => WF.props as T;
};

let id = 0;
let preId = "";

export const idHOF = () => {
  let workingFiber = getWF();
  if (id === Number.MAX_SAFE_INTEGER) {
    preId += id.toString(32);
    id = 0;
  }
  workingFiber.id = `u:${preId}${(id++).toString(32)}`;
  return (WF: Fiber) => WF.id;
};

export const runStateEffects = (fiber: Fiber) => {
  for (let effect of fiber.stateEffects ?? []) {
    effect();
  }
};

export function use<T extends (...args: any[]) => any>(fn: T): ReturnType<T>;
export function use<T extends (...args: any[]) => any>(
  fn: T,
  raFn: Function
): ReturnType<T>;
export function use<T extends (...args: any[]) => any>(fn: T, raFn?: Function) {
  const workingFiber = getWF();
  const effect = () => raFn?.(fn(getWF()));
  if (workingFiber.stateEffects) {
    workingFiber.stateEffects.push(effect);
  } else {
    workingFiber.stateEffects = [effect];
  }
  return fn(workingFiber) as ReturnType<T>;
}

export function useState<T = undefined>(): [
  T | undefined,
  (value: T | undefined) => void
];
export function useState<T>(initial: T): [T, (value: T) => void];
export function useState<T>(initial?: T) {
  return use(stateHOF(initial), arguments[1]);
}

export function useProps<T>(p: T) {
  return use(propsHOF(p), arguments[1]);
}

export function useReducer<T, T2>(reducerFn: Reducer<T, T2>, initial: T) {
  return use(reducerHOF(reducerFn, initial), arguments[2]);
}

export function useId() {
  return use(idHOF(), arguments[0]);
}

export function useRef<T>(): Ref<T | undefined>;
export function useRef<T>(value: T): Ref<T>;
export function useRef<T>(value?: T) {
  return { current: value };
}

export const useEffect = (cb: Effect, depsFn?: () => any[]) => {
  const workingFiber = getWF();
  cb.depsFn = depsFn;
  if (workingFiber.effects) {
    workingFiber.effects.push(cb);
  } else {
    workingFiber.effects = [cb];
  }
};

export const runEffects = (fiber: Fiber, leave = false) => {
  if (!fiber.effects) return;
  for (const effect of fiber.effects) {
    const deps = effect.depsFn?.();
    const equal = arraysEqual(deps, effect.deps);
    effect.deps = deps;
    if (leave) {
      effect.clear?.();
      continue;
    }
    if (equal) continue;
    effect.clear?.();
    effect.clear = effect();
  }
};
