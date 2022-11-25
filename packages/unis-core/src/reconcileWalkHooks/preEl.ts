import {
  Fiber,
  findLastDOMFiber,
  FLAG,
  isDOM,
  isPortal,
  matchFlag,
  ReconcileState,
  WalkHook,
} from "../fiber";

const setWorkingPreEl = (
  reconcileState: ReconcileState,
  preDOMFiber?: Fiber
) => {
  reconcileState.workingPreDOMFiber = preDOMFiber;
};

// const setWorkingPreEl = (fiber: Fiber, workingPreEl: FiberEl | undefined) => {
//   if (fiber.reconcileState) fiber.reconcileState.workingPreEl = workingPreEl;
// };

const setReuseFiberPreEl = (fiber: Fiber) => {
  if (!matchFlag(fiber.commitFlag, FLAG.REUSE)) return;
  const lastDOMFiber = findLastDOMFiber(fiber.alternate!);
  lastDOMFiber && setWorkingPreEl(fiber.reconcileState!, lastDOMFiber);
};

// const setReuseFiberPreEl = (fiber: Fiber) => {
//   if (!matchFlag(fiber.commitFlag, FLAG.REUSE)) return;
//   const lastEl = findLastEl(fiber.alternate!);
//   lastEl && setWorkingPreEl(fiber, lastEl);
// };

export const preElWalkHook: WalkHook = {
  down: (from: Fiber, to?: Fiber) => {
    isDOM(from) && setWorkingPreEl(from.reconcileState!, undefined);
    isPortal(from) && setWorkingPreEl(from.reconcileState!, undefined);
  },

  up: (from: Fiber, to?: Fiber) => {
    if (to) {
      isDOM(to) && setWorkingPreEl(from.reconcileState!, to);
      isPortal(to) && setWorkingPreEl(from.reconcileState!, to.preDOMFiber);
    }
    setReuseFiberPreEl(from);
  },

  sibling: (from: Fiber, to?: Fiber) => {
    if (matchFlag(from.commitFlag, FLAG.REUSE)) {
      setReuseFiberPreEl(from);
    } else {
      isDOM(from) && setWorkingPreEl(from.reconcileState!, from);
    }
  },

  return: (retn?: Fiber) => {
    if (retn && matchFlag(retn.commitFlag, FLAG.INSERT | FLAG.CREATE))
      retn.preDOMFiber = retn.reconcileState!.workingPreDOMFiber;
  },
};
