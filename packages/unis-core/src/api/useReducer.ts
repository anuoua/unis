import { Effect, markFiber } from ".";
import { use } from "./use";
import { Fiber, findRoot, findRuntime, MemorizeState, TokTik } from "../fiber";
import { readyForWork } from "../reconcile";

export type Reducer<T, T2> = (state: T, action: T2) => T;

const readyList: (() => Fiber)[] = [];

const triggerReconcile = () => {
  const fibers = new Set(readyList.map((getFiber) => getFiber()));
  fibers.forEach(markFiber);

  // multiple app trigger same time
  const rootFibers = new Set(Array.from(fibers).map(findRoot));
  rootFibers.forEach(readyForWork);

  readyList.length = 0;
};

export const reducerHOF = <T extends any, T2 extends any>(
  reducerFn: Reducer<T, T2>,
  initial: T
) => {
  let currentFiber: Fiber | undefined; // do not getWF here, workingFiber should be assigned in effect.
  let freshFiber: Fiber | undefined;
  let freshMemorizeState: MemorizeState | undefined;
  let toktik: TokTik | undefined;

  let memorizeState: MemorizeState = {
    value: undefined,
    dispatchValue: initial,
    deps: [initial],
  };

  const dispatch = (action: T2) => {
    if (!currentFiber) return console.warn("Component is not created");
    if (currentFiber.isDestroyed)
      return console.warn("Component has been destroyed");

    const newState = reducerFn(memorizeState.value, action);
    if (Object.is(newState, memorizeState.value)) return;

    memorizeState.dispatchValue = newState;
    memorizeState.deps = [newState];

    if (freshFiber) {
      toktik!.clearTikTaskQueue();
    }

    readyList.push(() => currentFiber!);

    if (readyList.length === 1) {
      toktik!.addTok(triggerReconcile, true);
    }
  };

  const effect: Effect = () => {
    currentFiber = freshFiber!;
    memorizeState = freshMemorizeState!;
    if (!toktik) toktik = findRuntime(currentFiber).toktik;
    freshFiber = undefined;
    freshMemorizeState = undefined;
  };

  return (WF: Fiber) => {
    freshFiber = WF;

    addDispatchEffect(freshFiber, effect);

    freshMemorizeState = {
      value:
        memorizeState.deps.length > 0
          ? memorizeState.dispatchValue
          : memorizeState.value,
      deps: [],
    };

    linkMemorizeState(freshFiber, freshMemorizeState);

    return [freshMemorizeState.value, dispatch] as const;
  };
};

export function useReducer<T, T2>(reducerFn: Reducer<T, T2>, initial: T) {
  return use(reducerHOF(reducerFn, initial), arguments[2]);
}

export const addDispatchEffect = (freshFiber: Fiber, effect: Effect) => {
  freshFiber.reconcileState!.dispatchEffectList?.push(effect) ??
    (freshFiber.reconcileState!.dispatchEffectList = [effect]);
};

export const linkMemorizeState = (
  freshFiber: Fiber,
  freshMemorizeState: MemorizeState
) => {
  if (freshFiber.memorizeState) {
    const first = freshFiber.memorizeState.next;
    freshFiber.memorizeState.next = freshMemorizeState;
    freshMemorizeState.next = first;
  } else {
    freshFiber.memorizeState = freshMemorizeState;
    freshMemorizeState.next = freshMemorizeState;
  }
};
