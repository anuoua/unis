import { EFFECT_TYPE } from "../api/utils";
import { Fiber, WalkHook } from "../fiber";

const pushEffect = (fiber: Fiber) => {
  const { reconcileState } = fiber;
  reconcileState!.commitList.push(fiber);
  for (const effect of fiber.effects ?? []) {
    switch (effect.type) {
      case EFFECT_TYPE.LAYOUT:
        reconcileState?.layoutEffectList.push(effect);
        break;
      case EFFECT_TYPE.TICK:
        reconcileState?.tickEffectList.push(effect);
    }
  }
};

export const effectWalkHook: WalkHook = {
  up: (from: Fiber, to?: Fiber) => {
    to?.commitFlag && pushEffect(to);
  },

  enter: (enter: Fiber, skipChild: boolean) => {
    (!enter.child || skipChild) && enter.commitFlag && pushEffect(enter);
  },
};
