import { clearEffects } from "./api";
import {
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
  getContainerElFiber,
  graft,
  isComponent,
  isElement,
  matchFlag,
  isText,
  isDOM,
  ReconcileState,
  isPortal,
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
  const container = getContainerElFiber(fiber)!;

  const insertElements = isDOM(fiber)
    ? [fiber.el!]
    : findEls(
        matchFlag(fiber.commitFlag, FLAG.REUSE) ? fiber.alternate! : fiber
      );

  const insertTarget = isPortal(container)
    ? null
    : fiber.preElFiber
    ? nextSibling(fiber.preElFiber)
    : firstChild(container);

  for (const insertElement of insertElements) {
    insertBefore(container, insertElement, insertTarget);
  }
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
    fiber.preElFiber = undefined;
    fiber.alternate = undefined;
    fiber.commitFlag = undefined;
  }
};
