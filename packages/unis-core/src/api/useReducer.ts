import { Effect, markFiber } from ".";
import { use } from "./use";
import { Fiber, findToRoot, MemorizeState } from "../fiber";
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

    const rootFibers = new Set(
      Array.from(fibers).map(
        (fiber) => findToRoot(fiber, (fiber) => !fiber.parent)!
      )
    );
    rootFibers.forEach(readyForWork);

    pendingList.length = 0;
  }, true);
};

export const reducerHOF = <T extends any, T2 extends any>(
  reducerFn: Reducer<T, T2>,
  initial: T
) => {
  let currentFiber: Fiber; // do not getWF here, workingFiber should be assigned in effect.
  let freshFiber: Fiber | undefined;
  let freshMemorizeState: MemorizeState | undefined;

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
      clearTikTaskQueue();
    }
    triggerDebounce(() => currentFiber);
  };

  const effect: Effect = () => {
    currentFiber = freshFiber!;
    memorizeState = freshMemorizeState!;
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
