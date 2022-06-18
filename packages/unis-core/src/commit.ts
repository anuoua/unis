import { runEffects } from "./api";
import {
  append,
  createFragment,
  firstChild,
  insertBefore,
  nextSibling,
  remove,
  updateProperties,
} from "./dom";
import {
  createNext,
  Fiber,
  findEls,
  FLAG,
  getContainer,
  graft,
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

  do {
    indexFiber.preEl = undefined;
    indexFiber.dependencies = undefined;
    indexFiber.attrDiff = undefined;
  } while ((indexFiber = next(indexFiber)));

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
        isComponent(effect) && comps.push(effect);
        break;
      case FLAG.REUSE:
        graft(effect, effect.alternate!);
        break;
    }
    effect.alternate = undefined;
  }
  comps.forEach((i) => runEffects(i));
};
