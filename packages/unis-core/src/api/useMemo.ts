import { getWF } from ".";
import { use } from "./use";
import { Fiber, MemorizeState } from "../fiber";
import { arraysEqual } from "../utils";

export const memoHOF = <T extends unknown>(
  handler: () => T,
  depsFn?: () => any[]
) => {
  let workingFiber = getWF();
  let freshFiber: Fiber | undefined;
  let freshDeps: any[];

  {
    const effect = () => {
      workingFiber = freshFiber!;
      memorizeState = freshMemorizeState!;
      memorizeState.deps = freshDeps;
      freshFiber = undefined;
      freshMemorizeState = undefined;
    };
    workingFiber.dispatchBindEffects?.push(effect) ??
      (workingFiber.dispatchBindEffects = [effect]);
  }

  let memorizeState: MemorizeState = {
    value: undefined,
    deps: undefined,
  };
  let freshMemorizeState: MemorizeState | undefined;

  return (WF: Fiber) => {
    freshFiber = WF;
    freshDeps = depsFn?.() ?? freshDeps;

    freshMemorizeState = {
      value:
        depsFn && arraysEqual(memorizeState.deps, freshDeps)
          ? memorizeState.value
          : handler(),
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

    return freshMemorizeState.value as T;
  };
};

export function useMemo<T extends unknown>(
  handler: () => T,
  depsFn?: () => any[]
) {
  return use(memoHOF(handler, depsFn), arguments[2]);
}
