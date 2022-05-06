import { runEffects } from "./api";
import {
  append,
  createFragment,
  findEls,
  firstChild,
  getContainer,
  insertBefore,
  nextSibling,
  remove,
  updateProperties,
} from "./dom";
import {
  createNext,
  Fiber,
  FLAG,
  isComponent,
  isElement,
  isPortal,
} from "./fiber";

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
    enter(enter) {
      delete enter.preEl;
      if (enter === fiber && !enter.child) {
        destroy(enter);
        return false;
      }
    },
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
  append(fragment, ...findEls([fiber]));
  insertBefore(
    container,
    fragment,
    isPortalContainer
      ? null
      : fiber.preEl
      ? nextSibling(fiber.preEl)
      : firstChild(container)
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
