import {
  clearAndRunEffects,
  clearEffects,
  effectDepsEqual,
  Effect,
  runEffects,
} from "./api";
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
  isDOM,
} from "./fiber";
import { addTik } from "./toktik";

export const commitDeletion = (fiber: Fiber) => {
  let indexFiber: Fiber | undefined = fiber;

  while (indexFiber) {
    if (isElement(indexFiber)) {
      indexFiber.props.ref && (indexFiber.props.ref.current = undefined);
    }
    if (isComponent(indexFiber)) {
      clearEffects(indexFiber.effects);
      clearEffects(indexFiber.layoutEffects);
    }
    /**
     * remove input element may trigger blur sync event,
     * so isDestroyed must be true before remove to prevent dispatch in useReducer.
     */
    indexFiber.isDestroyed = true;
    if (isPortal(indexFiber)) {
      indexFiber.child && remove(indexFiber.child);
    }
    indexFiber.dependencies = undefined;
    indexFiber.reconcileState = undefined;

    if (indexFiber.child) {
      indexFiber = indexFiber.child;
      continue;
    } else if (indexFiber === fiber) {
      indexFiber = undefined;
      continue;
    }

    while (indexFiber) {
      if (indexFiber.sibling) {
        indexFiber = indexFiber.sibling;
        break;
      }

      if (indexFiber.parent !== fiber) {
        indexFiber = indexFiber.parent;
      } else {
        indexFiber = undefined;
        break;
      }
    }
  }

  remove(fiber);
};

export const commitUpdate = (fiber: Fiber) => {
  if (isText(fiber)) updateTextProperties(fiber);
  if (isElement(fiber)) updateElementProperties(fiber);
};

export const commitInsert = (fiber: Fiber) => {
  const [container, isPortalContainer] = getContainer(fiber)!;

  let insertElement = isDOM(fiber) ? fiber.el : undefined;

  if (!insertElement) {
    insertElement = createFragment();
    const els = findEls(
      matchFlag(fiber.commitFlag, FLAG.REUSE) ? fiber.alternate! : fiber
    );
    append(insertElement, ...els);
  }

  insertBefore(
    container,
    insertElement,
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
      commitDeletion(effect.alternate!);
      continue;
    }
    if (matchFlag(effect.commitFlag, FLAG.UPDATE)) {
      commitUpdate(effect);
    }
    if (matchFlag(effect.commitFlag, FLAG.INSERT | FLAG.CREATE)) {
      commitInsert(effect);
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

  /**
   * clear and run layoutEffects
   */
  const triggeredLayoutEffects: Effect[] = [];

  effectComps.forEach((comp) =>
    comp.layoutEffects?.forEach((e) => {
      const equal = effectDepsEqual(e);
      if (!equal) {
        triggeredLayoutEffects.push(e);
        clearEffects([e]);
      }
    })
  );

  runEffects(triggeredLayoutEffects);

  /**
   * clear and run effects
   */
  addTik(() => effectComps.forEach((i) => clearAndRunEffects(i.effects)));
};
