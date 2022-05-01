import { createFragment, findEls, remove, updateProperties } from "./dom";
import { Fiber, FiberEl, FLAG, isComponent, isElement } from "./fiber";
import { arraysEqual } from "./utils";

export const getContainer = (
  fiber: Fiber | undefined
): [FiberEl | undefined, boolean] => {
  while ((fiber = fiber?.parent)) {
    if (fiber.to) return [fiber.to, true];
    if (fiber.el) return [fiber.el, false];
  }
  return [undefined, false];
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
  remove(fiber);
};

export const commitCommon = (fiber: Fiber) => {
  const [container, isPortalContainer] = getContainer(fiber);
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
