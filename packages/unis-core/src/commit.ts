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
  let iFiber: Fiber | undefined = fiber;

  while (iFiber) {
    if (isHostElement(iFiber)) {
      iFiber.props.ref && (iFiber.props.ref.current = undefined);
    }
    if (isComponent(iFiber)) {
      clearEffects(iFiber.effects);
    }
    /**
     * remove input element may trigger blur sync event,
     * so isDestroyed must be true before remove to prevent dispatch in useReducer.
     */
    iFiber.isDestroyed = true;
    if (isPortal(iFiber)) {
      iFiber.child && operator.remove(iFiber.child);
    }
    iFiber.dependencies = undefined;
    iFiber.reconcileState = undefined;

    if (iFiber.child) {
      iFiber = iFiber.child;
      continue;
    } else if (iFiber === fiber) {
      iFiber = undefined;
      continue;
    }

    while (iFiber) {
      if (iFiber.sibling) {
        iFiber = iFiber.sibling;
        break;
      }

      if (iFiber.parent !== fiber) {
        iFiber = iFiber.parent;
      } else {
        iFiber = undefined;
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
