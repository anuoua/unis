import { createFragment, findEls, remove, updateProperties } from "./dom";
import { Fiber, FiberEl, FLAG, isComponent, isElement } from "./fiber";
import { arraysEqual } from "./utils";

export const getContainer = (fiber: Fiber | undefined): FiberEl | undefined => {
  while ((fiber = fiber?.parent)) {
    if (fiber.to) return fiber.to;
    if (fiber.el) return fiber.el as Element;
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
    isElement(fiber) && remove(fiber);
    isComponent(fiber) && runEffects(fiber, true);
  };

  const loop = (indexFiber: Fiber | undefined, topFiber: Fiber) => {
    if (indexFiber?.child) return indexFiber.child;
    if (indexFiber === topFiber) return destroy(indexFiber);
    while (indexFiber) {
      if (indexFiber.sibling) {
        if (!indexFiber.sibling.child) destroy(indexFiber.sibling);
        return indexFiber.sibling;
      }
      indexFiber = indexFiber.parent;
      if (indexFiber) destroy(indexFiber);
      if (indexFiber === topFiber) return;
    }
  };

  let indexFiber: Fiber | undefined | void = fiber;
  while ((indexFiber = loop(indexFiber, fiber))) {}
};

export const commitCommon = (fiber: Fiber, container?: FiberEl) => {
  if (isElement(fiber)) updateProperties(fiber);
  if (!container) return;
  const fragment = createFragment();
  fragment.append(...findEls([fiber]));
  container.insertBefore(
    fragment,
    fiber.preEl ? fiber.preEl.nextSibling : container.childNodes[0]
  );
};

export const commitEffectList = (effect: Fiber | undefined) => {
  const comps: Fiber[] = [];
  while (effect) {
    switch (effect.commitFlag) {
      case FLAG.DELETE:
        commitDeletion(effect);
        break;
      case FLAG.UPDATE:
      case FLAG.CREATE:
      case FLAG.INSERT:
        commitCommon(
          effect,
          effect.commitFlag === FLAG.UPDATE ? undefined : getContainer(effect)
        );
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
    isComponent(effect) && comps.push(effect);
    delete effect.commitFlag;
    delete effect.alternate;
    const nextEffect = effect.nextEffect;
    delete effect.nextEffect;
    effect = nextEffect;
  }
  comps.forEach((i) => runEffects(i));
};
