import { clearEffects, runEffects } from "./api";
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
import { addTik } from "./toktik";

export const commitDeletion = (fiber: Fiber, effectComps: Fiber[]) => {
  const [next, addHook] = createNext();

  addHook({
    enter(enter) {
      if (enter === fiber && !enter.child) return false;
    },
    up(from, to) {
      if (to === fiber) return false;
    },
  });

  let indexFiber: Fiber | undefined = fiber;

  do {
    if (isElement(indexFiber)) {
      indexFiber.props.ref && (indexFiber.props.ref.current = undefined);
    }
    if (isComponent(indexFiber)) {
      effectComps.push(indexFiber);
    }
    if (isPortal(indexFiber)) {
      indexFiber.child && remove(indexFiber.child);
    }
    indexFiber.dependencies = undefined;
    indexFiber.reconcileState = undefined;
    indexFiber.isDestroyed = true;
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
    ...findEls(
      matchFlag(fiber.commitFlag, FLAG.REUSE) ? fiber.alternate! : fiber
    )
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
  const effectComps: Fiber[] = [];
  for (let effect of effectList) {
    if (matchFlag(effect.commitFlag, FLAG.DELETE)) {
      commitDeletion(effect.alternate!, effectComps);
      continue;
    }
    if (matchFlag(effect.commitFlag, FLAG.UPDATE)) {
      commitUpdate(effect);
    }
    if (matchFlag(effect.commitFlag, FLAG.CREATE | FLAG.INSERT)) {
      commitInset(effect);
    }
    if (matchFlag(effect.commitFlag, FLAG.REUSE)) {
      graft(effect, effect.alternate!);
    } else {
      isComponent(effect) && effectComps.push(effect);
    }
    effect.preEl = undefined;
    effect.alternate = undefined;
    effect.commitFlag = undefined;
  }

  const callEffects = (type: "layoutEffects" | "effects") =>
    effectComps
      .filter((i) => {
        clearEffects(i[type]);
        return !i.isDestroyed;
      })
      .forEach((i) => runEffects(i[type]));

  callEffects("layoutEffects");

  addTik(() => callEffects("effects"));
};
