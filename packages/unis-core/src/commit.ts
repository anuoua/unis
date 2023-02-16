import { clearEffects } from "./api";
import {
  append,
  createDOMFragment,
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
  ReconcileState,
} from "./fiber";

export const commitDeletion = (fiber: Fiber) => {
  let indexFiber: Fiber | undefined = fiber;

  while (indexFiber) {
    if (isElement(indexFiber)) {
      indexFiber.props.ref && (indexFiber.props.ref.current = undefined);
    }
    if (isComponent(indexFiber)) {
      clearEffects(indexFiber.effects);
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
    insertElement = createDOMFragment();
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

export const commit = (reconcileState: ReconcileState) => {
  for (let fiber of reconcileState.commitList) {
    if (matchFlag(fiber.commitFlag, FLAG.DELETE)) {
      commitDeletion(fiber.alternate!);
      continue;
    }
    if (matchFlag(fiber.commitFlag, FLAG.UPDATE)) {
      commitUpdate(fiber);
    }
    if (matchFlag(fiber.commitFlag, FLAG.CREATE) && isDOM(fiber)) {
      commitInsert(fiber);
    }
    if (matchFlag(fiber.commitFlag, FLAG.INSERT)) {
      commitInsert(fiber);
    }
    if (matchFlag(fiber.commitFlag, FLAG.REUSE)) {
      graft(fiber, fiber.alternate!);
    }
    fiber.preEl = undefined;
    fiber.alternate = undefined;
    fiber.commitFlag = undefined;
  }
};
