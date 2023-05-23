import {
  Fiber,
  findLastElFiber,
  FLAG,
  isElement,
  isPortal,
  matchFlag,
  WalkHook,
} from "../fiber";

const setWorkingPreElFiber = (
  fiber: Fiber,
  workingPreElFiber: Fiber | undefined
) => {
  if (fiber.reconcileState)
    fiber.reconcileState.workingPreElFiber = workingPreElFiber;
};

const setReuseFiberPreElFiber = (fiber: Fiber) => {
  if (!matchFlag(fiber.commitFlag, FLAG.REUSE)) return;
  const lastElFiber = findLastElFiber(fiber.alternate!);
  lastElFiber && setWorkingPreElFiber(fiber, lastElFiber);
};

export const preElFiberWalkHook: WalkHook = {
  down: (from: Fiber, to?: Fiber) => {
    isElement(from) && setWorkingPreElFiber(from, undefined);
    isPortal(from) && setWorkingPreElFiber(from, undefined);
  },

  up: (from: Fiber, to?: Fiber) => {
    if (to) {
      isElement(to) && setWorkingPreElFiber(from, to);
      isPortal(to) && setWorkingPreElFiber(from, to.preElFiber);
    }
    setReuseFiberPreElFiber(from);
  },

  sibling: (from: Fiber, to?: Fiber) => {
    if (matchFlag(from.commitFlag, FLAG.REUSE)) {
      setReuseFiberPreElFiber(from);
    } else {
      isElement(from) && setWorkingPreElFiber(from, from);
    }
  },

  return: (retn?: Fiber) => {
    if (retn && matchFlag(retn.commitFlag, FLAG.INSERT))
      retn.preElFiber = retn.reconcileState!.workingPreElFiber;
  },
};
