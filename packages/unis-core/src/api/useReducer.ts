import { getWF, markFiber } from ".";
import { use } from "./use";
import { Fiber, findRoot, MemorizeState } from "../fiber";
import { readyForWork } from "../reconcile";
import { addTok, clearTikTaskQueue } from "../toktik";

export type Reducer<T, T2> = (state: T, action: T2) => T;

const pendingList: (() => Fiber)[] = [];

const triggerDebounce = (getFiber: () => Fiber) => {
  pendingList.push(getFiber);

  if (pendingList.length > 1) return;

  addTok(() => {
    const fibers = new Set(pendingList.map((getFiber) => getFiber()));
    fibers.forEach(markFiber);

    const rootFibers = new Set(Array.from(fibers).map(findRoot));
    rootFibers.forEach(readyForWork);

    pendingList.length = 0;
  }, true);
};

export const reducerHOF = <T extends any, T2 extends any>(
  reducerFn: Reducer<T, T2>,
  initial: T
) => {
  let workingFiber = getWF();
  let freshFiber: Fiber | undefined;

  const dispatch = (action: T2) => {
    if (!workingFiber) return console.warn("Component is not created");
    if (workingFiber.isDestroyed)
      return console.warn("Component has been destroyed");
    const newState = reducerFn(memorizeState.value, action);
    if (Object.is(newState, memorizeState.value)) return;
    // state = reducerFn(state, action);
    memorizeState.dispatchValue = newState;
    if (freshFiber) {
      clearTikTaskQueue();
    }
    triggerDebounce(() => workingFiber!);
  };

  {
    const effect = () => {
      workingFiber = freshFiber!;
      memorizeState = freshMemorizeState!;
      freshFiber = undefined;
      freshMemorizeState = undefined;
    };
    workingFiber.dispatchBindEffects?.push(effect) ??
      (workingFiber.dispatchBindEffects = [effect]);
  }

  let memorizeState: MemorizeState = {
    value: undefined,
    dispatchValue: initial,
    deps: [],
  };
  let freshMemorizeState: MemorizeState | undefined;

  return (WF: Fiber) => {
    freshFiber = WF;

    freshMemorizeState = {
      value: memorizeState?.dispatchValue ?? memorizeState.value,
      deps: memorizeState?.deps,
    };

    if (freshFiber.memorizeState) {
      const first = freshFiber.memorizeState.next;
      freshFiber.memorizeState.next = freshMemorizeState;
      freshMemorizeState.next = first;
    } else {
      freshFiber.memorizeState = freshMemorizeState;
      freshMemorizeState.next = freshMemorizeState;
    }

    return [freshMemorizeState.value, dispatch] as const;
  };
};

export function useReducer<T, T2>(reducerFn: Reducer<T, T2>, initial: T) {
  return use(reducerHOF(reducerFn, initial), arguments[2]);
}
