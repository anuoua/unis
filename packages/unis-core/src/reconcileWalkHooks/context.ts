import { createDependency, findDependency } from "../context";
import { createNext, Fiber, isProvider, WalkHook } from "../fiber";
import { markFiber } from "../api/utils";

export const contextWalkHook: WalkHook = {
  down: (from: Fiber, to?: Fiber) => {
    isProvider(from) &&
      from.reconcileState!.dependencyList.push(createDependency(from));
  },

  up: (from: Fiber, to?: Fiber) => {
    to && isProvider(to) && from.reconcileState!.dependencyList.pop();
  },

  enter: (enter: Fiber, skipChild: boolean) => {
    if (
      enter.alternate &&
      isProvider(enter.alternate) &&
      !Object.is(enter.alternate.props.value, enter.props.value)
    ) {
      let alternate = enter.alternate;
      let iFiber: Fiber | undefined = alternate;

      const [next, addHook] = createNext();

      addHook({ up: (from, to) => to !== alternate });

      do {
        findDependency(iFiber, enter) && markFiber(iFiber);
        iFiber = next(
          iFiber,
          iFiber !== alternate && isProvider(iFiber) && iFiber.tag === enter.tag
        );
      } while (iFiber);
    }
  },
};
