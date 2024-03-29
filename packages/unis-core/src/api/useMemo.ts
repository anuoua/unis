import { use } from "./use";
import { Fiber, MemorizeState } from "../fiber";
import { arraysEqual } from "../utils";
import { addDispatchEffect, linkMemorizeState } from "./useReducer";

export const memoHof = <T extends unknown>(
  handler: () => T,
  depsFn?: () => any[]
) => {
  let freshFiber: Fiber | undefined;
  let freshDeps: any[];
  let freshMemorizeState: MemorizeState | undefined;

  let memorizeState: MemorizeState = {
    value: undefined,
    deps: undefined!,
  };

  const effect = () => {
    memorizeState = freshMemorizeState!;
    memorizeState.deps = freshDeps;
    freshFiber = undefined;
    freshMemorizeState = undefined;
  };

  return (WF: Fiber) => {
    freshFiber = WF;
    freshDeps = depsFn?.() ?? freshDeps;

    addDispatchEffect(freshFiber, effect);

    freshMemorizeState = {
      value:
        depsFn && arraysEqual(memorizeState.deps, freshDeps)
          ? memorizeState.value
          : handler(),
      deps: memorizeState?.deps,
    };

    linkMemorizeState(freshFiber, freshMemorizeState);

    return freshMemorizeState.value as T;
  };
};

export function useMemo<T extends unknown>(
  handler: () => T,
  depsFn?: () => any[]
) {
  return use(memoHof(handler, depsFn), arguments[2]);
}
