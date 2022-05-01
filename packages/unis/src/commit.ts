import { createFragment, findEls, remove, updateProperties } from "./dom";
import {
  createNext,
  Fiber,
  FiberEl,
  FLAG,
  isComponent,
  isElement,
  isPortal,
} from "./fiber";
import { arraysEqual } from "./utils";

export const getContainer = (
  fiber: Fiber | undefined
): [FiberEl | undefined, boolean] | undefined => {
  while ((fiber = fiber?.parent)) {
    if (fiber.to) return [fiber.to, true];
    if (fiber.el) return [fiber.el, false];
  }
};

export const runEffects = (fiber: Fiber, leave = false) => {
  if (!fiber.effects) return;
  for (const effect of fiber.effects) {
    const deps = effect.depsFn?.();
    const equal = arraysEqual(deps, effect.deps);
    effect.deps = deps;
    if (leave) {
      effect.clear?.();
      continue;
    }
    if (equal) continue;
    effect.clear?.();
    effect.clear = effect();
  }
};

export const commitDeletion = (fiber: Fiber) => {
  const destroy = (fiber: Fiber) => {
    if (isElement(fiber)) {
      fiber.props.ref && (fiber.props.ref.current = undefined);
    }
    if (isComponent(fiber)) {
      runEffects(fiber, true);
      remove(fiber);
    }
    if (isPortal(fiber)) {
      fiber.child && remove(fiber.child);
    }
  };

  const [next, addHook] = createNext();

  addHook({
    up(from, to) {
      if (to) destroy(to);
      if (to === fiber) return false;
    },
    sibling(from, to) {
      if (to && !to.child) destroy(to);
    },
  });

  let indexFiber: Fiber | undefined = fiber;
  while ((indexFiber = next(indexFiber))) {}
  remove(fiber);
};

export const commitCommon = (fiber: Fiber) => {
  const [container, isPortalContainer] = getContainer(fiber)!;
  if (isElement(fiber)) updateProperties(fiber);
  if (fiber.commitFlag === FLAG.UPDATE) return;
  if (!container) return;
  const fragment = createFragment();
  fragment.append(...findEls([fiber]));
  container.insertBefore(
    fragment,
    isPortalContainer
      ? null
      : fiber.preEl
      ? fiber.preEl.nextSibling
      : container.childNodes[0]
  );
};

export const commitEffectList = (effectList: Fiber[]) => {
  const comps: Fiber[] = [];
  for (let effect of effectList) {
    switch (effect.commitFlag) {
      case FLAG.DELETE:
        commitDeletion(effect);
        break;
      case FLAG.UPDATE:
      case FLAG.CREATE:
      case FLAG.INSERT:
        commitCommon(effect);
        break;
      case FLAG.REUSE:
        const parent = effect.parent!;
        const parentChildren = parent.children!;
        const alternate = effect.alternate!;
        alternate.sibling = effect.sibling;
        alternate.parent = parent;
        parentChildren[effect.index!] = alternate;
        parent.child = parentChildren![0];
        break;
    }
    effect.commitFlag !== FLAG.REUSE &&
      isComponent(effect) &&
      comps.push(effect);
    delete effect.commitFlag;
    delete effect.alternate;
  }
  comps.forEach((i) => runEffects(i));
};
