import { Fiber, WalkHook } from "../fiber";

const pushEffect = (fiber: Fiber) =>
  fiber.reconcileState!.effectList.push(fiber);

export const effectWalkHook: WalkHook = {
  up: (from: Fiber, to?: Fiber) => {
    to?.commitFlag && pushEffect(to);
  },

  enter: (enter: Fiber, skipChild: boolean) => {
    (!enter.child || skipChild) && enter.commitFlag && pushEffect(enter);
  },
};
