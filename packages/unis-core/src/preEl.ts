import {
  Fiber,
  FiberEl,
  findEls,
  FLAG,
  isDOM,
  isPortal,
  matchFlag,
  WalkHook,
} from "./fiber";

const setWorkingPreEl = (fiber: Fiber, workingPreEl: FiberEl | undefined) => {
  if (fiber.reconcileState) fiber.reconcileState.workingPreEl = workingPreEl;
};

const setReuseFiberPreEl = (fiber: Fiber) => {
  if (!matchFlag(fiber.commitFlag, FLAG.REUSE)) return;
  const endEl = findEls([fiber.alternate!]).pop();
  endEl && setWorkingPreEl(fiber, endEl);
};

export const preElWalkHook: WalkHook = {
  down: (from: Fiber, to?: Fiber) => {
    isDOM(from) && setWorkingPreEl(from, undefined);
    isPortal(from) && setWorkingPreEl(from, undefined);
  },

  up: (from: Fiber, to?: Fiber) => {
    if (to) {
      isDOM(to) && setWorkingPreEl(from, to.el);
      isPortal(to) && setWorkingPreEl(from, to.preEl);
    }
    setReuseFiberPreEl(from);
  },

  sibling: (from: Fiber, to?: Fiber) => {
    if (matchFlag(from.commitFlag, FLAG.REUSE)) {
      setReuseFiberPreEl(from);
    } else {
      isDOM(from) && setWorkingPreEl(from, from.el);
    }
  },

  return: (retn?: Fiber) => {
    if (retn && matchFlag(retn.commitFlag, FLAG.INSERT | FLAG.CREATE))
      retn.preEl = retn.reconcileState!.workingPreEl;
  },
};
