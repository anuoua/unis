import { Fiber, WalkHook } from "../fiber";

export const pushEffect = (fiber: Fiber) => {
  fiber.reconcileState!.commitList.push(fiber);
};

export const effectWalkHook: WalkHook = {
  up: (from, to) => {
    !from.child && from.commitFlag && pushEffect(from);
    to?.commitFlag && pushEffect(to);
  },
  sibling: (from) => {
    !from.child && from.commitFlag && pushEffect(from);
  },
};
