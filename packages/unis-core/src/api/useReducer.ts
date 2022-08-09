import { getWF, markFiber } from ".";
import { use } from "./use";
import { Fiber, findRoot } from "../fiber";
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
  let state = initial;
  let workingFiber: Fiber | undefined;
  let freshFiber: Fiber | undefined;

  const dispatch = (action: T2) => {
    if (!workingFiber) return console.warn("Component is not created");
    if (workingFiber.isDestroyed)
      return console.warn("Component has been destroyed");
    const newState = reducerFn(state, action);
    if (Object.is(newState, state)) return;
    state = reducerFn(state, action);
    if (freshFiber) {
      clearTikTaskQueue();
    }
    triggerDebounce(() => workingFiber!);
  };

  const fiber = (workingFiber || getWF())!;
  const effect = () => {
    workingFiber = freshFiber;
    freshFiber = undefined;
  };
  fiber.dispatchBindEffects?.push(effect) ??
    (fiber.dispatchBindEffects = [effect]);

  return (WF: Fiber) => {
    freshFiber = WF;
    return [state, dispatch] as const;
  };
};

export function useReducer<T, T2>(reducerFn: Reducer<T, T2>, initial: T) {
  return use(reducerHOF(reducerFn, initial), arguments[2]);
}
