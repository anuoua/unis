import { runEffects } from "./api";
import {
  append,
  createFragment,
  firstChild,
  insertBefore,
  nextSibling,
  remove,
  updateElementProperties,
  updateTextProperties,
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
  matchFlag,
  isPortal,
  isText,
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
    indexFiber.reconcileState = undefined;
  } while ((indexFiber = next(indexFiber)));

  remove(fiber);
};

export const commitUpdate = (fiber: Fiber) => {
  if (isText(fiber)) updateTextProperties(fiber);
  if (isElement(fiber)) updateElementProperties(fiber);
};

export const commitInset = (fiber: Fiber) => {
  const [container, isPortalContainer] = getContainer(fiber)!;
  if (!container) return;
  const fragment = createFragment();
  append(
    fragment,
    ...findEls([
      matchFlag(fiber.commitFlag, FLAG.REUSE) ? fiber.alternate! : fiber,
    ])
  );
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
    if (matchFlag(effect.commitFlag, FLAG.DELETE)) {
      commitDeletion(effect);
      continue;
    }
    if (matchFlag(effect.commitFlag, FLAG.UPDATE)) {
      commitUpdate(effect);
    }
    if (
      matchFlag(effect.commitFlag, FLAG.CREATE) ||
      matchFlag(effect.commitFlag, FLAG.INSERT)
    ) {
      commitInset(effect);
    }
    if (matchFlag(effect.commitFlag, FLAG.REUSE)) {
      graft(effect, effect.alternate!);
    } else {
      isComponent(effect) && comps.push(effect);
    }
    effect.preEl = undefined;
    effect.alternate = undefined;
  }
  comps.forEach((i) => runEffects(i));
};
