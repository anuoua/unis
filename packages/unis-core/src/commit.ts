import { clearEffects } from "./api/utils";
import {
  Fiber,
  findEls,
  FLAG,
  getContainerElFiber,
  graft,
  isComponent,
  isHostElement,
  matchFlag,
  isText,
  isElement,
  ReconcileState,
  isPortal,
  Operator,
} from "./fiber";

export const commitDeletion = (fiber: Fiber, operator: Operator) => {
  let indexFiber: Fiber | undefined = fiber;

  while (indexFiber) {
    if (isHostElement(indexFiber)) {
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
      indexFiber.child && operator.remove(indexFiber.child);
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

  operator.remove(fiber);
};

export const commitUpdate = (fiber: Fiber, operator: Operator) => {
  if (isText(fiber)) operator.updateTextProperties(fiber);
  if (isHostElement(fiber)) operator.updateElementProperties(fiber);
};

export const commitInsert = (fiber: Fiber, operator: Operator) => {
  const container = getContainerElFiber(fiber)!;

  const insertElements = isElement(fiber)
    ? [fiber.el!]
    : findEls(
        matchFlag(fiber.commitFlag, FLAG.REUSE) ? fiber.alternate! : fiber
      );

  const insertTarget = isPortal(container)
    ? null
    : fiber.preElFiber
    ? operator.nextSibling(fiber.preElFiber)
    : operator.firstChild(container);

  for (const insertElement of insertElements) {
    operator.insertBefore(container, insertElement, insertTarget);
  }
};

export const commit = (reconcileState: ReconcileState) => {
  const { operator } = reconcileState.rootWorkingFiber.runtime!;
  for (const fiber of reconcileState.commitList) {
    if (matchFlag(fiber.commitFlag, FLAG.DELETE)) {
      commitDeletion(fiber.alternate!, operator);
      continue;
    }
    if (matchFlag(fiber.commitFlag, FLAG.UPDATE)) {
      commitUpdate(fiber, operator);
    }
    if (matchFlag(fiber.commitFlag, FLAG.CREATE) && isElement(fiber)) {
      commitInsert(fiber, operator);
    }
    if (matchFlag(fiber.commitFlag, FLAG.INSERT)) {
      commitInsert(fiber, operator);
    }
    if (matchFlag(fiber.commitFlag, FLAG.REUSE)) {
      graft(fiber, fiber.alternate!);
    }
    fiber.preElFiber = undefined;
    fiber.alternate = undefined;
    fiber.commitFlag = undefined;
  }
};
