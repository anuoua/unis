import {
  clearFlag,
  Fiber,
  FLAG,
  isElement,
  matchFlag,
  isPortal,
  isSame,
  mergeFlag,
  isComponent,
  ReconcileState,
  isText,
  findToRoot,
} from "./fiber";
import {
  classes,
  isNullish,
  isStr,
  isEvent,
  keys,
  styleStr,
  svgKey,
} from "./utils";

export type AttrDiff = [string, any, any][];

export const attrDiff = (
  newFiber: Record<string, any>,
  oldFiber: Record<string, any>,
  onlyEvent = false
) => {
  const diff: AttrDiff = [];
  const newProps = newFiber.props;
  const oldProps = oldFiber.props;

  const getRealAttr = (attr: string) => {
    if (attr === "className") return "class";
    if (attr === "htmlFor") return "for";
    if (newFiber.isSvg) return svgKey(attr);
    return attr.toLowerCase();
  };

  const getRealValue = (newValue: any, key: string) => {
    if (isNullish(newValue)) return;
    switch (key) {
      case "className":
        return isStr(newValue) ? newValue : classes(newValue);
      case "style":
        return isStr(newValue)
          ? newValue
          : styleStr(newValue as Partial<CSSStyleDeclaration>);
      default:
        return newValue;
    }
  };

  for (const key of keys({ ...newProps, ...oldProps })) {
    if (onlyEvent && !isEvent(key)) continue;
    if (["xmlns", "children"].includes(key)) continue;
    const newValue = newProps[key];
    const oldValue = oldProps[key];
    const realNewValue = getRealValue(newValue, key);
    const realOldValue = getRealValue(oldValue, key);
    if (
      !isNullish(newValue) &&
      !isNullish(oldValue) &&
      realNewValue === realOldValue
    )
      continue;
    diff.push([getRealAttr(key), realNewValue, realOldValue]);
  }

  return diff;
};

export const clone = (newFiber: Fiber, oldFiber: Fiber, commitFlag?: FLAG) =>
  Object.assign(
    {
      ...newFiber,
      commitFlag,
      alternate: oldFiber,
    },
    isComponent(newFiber)
      ? {
          renderFn: oldFiber.renderFn,
          rendered: oldFiber.rendered,
          stateEffects: oldFiber.stateEffects,
          effects: oldFiber.effects,
          id: oldFiber.id,
        }
      : isElement(newFiber)
      ? { el: oldFiber.el, isSvg: oldFiber.isSvg }
      : isPortal(newFiber)
      ? { to: oldFiber.to }
      : undefined
  );

export const reuse = (newFiber: Fiber, oldFiber: Fiber, commitFlag?: FLAG) => ({
  ...newFiber,
  commitFlag,
  alternate: oldFiber,
});

export const del = (oldFiber: Fiber): Fiber => ({
  commitFlag: FLAG.DELETE,
  alternate: oldFiber,
});

export const create = (
  newFiber: Fiber,
  parentFiber: Fiber,
  hydrate = false
) => {
  const retFiber = {
    ...newFiber,
    commitFlag: FLAG.CREATE,
  } as Fiber;

  if (isElement(newFiber)) {
    retFiber.isSvg = newFiber.tag === "svg" || parentFiber.isSvg;
    if (!hydrate) {
      retFiber.attrDiff = isText(retFiber)
        ? undefined
        : attrDiff(retFiber, { props: {} });
    }
  }

  if (isPortal(newFiber)) {
    retFiber.commitFlag = undefined;
  }

  return retFiber;
};

export const keyIndexMapGen = (
  children: Fiber[],
  start: number,
  end: number
) => {
  const map: any = {};
  for (let i = start; i <= end; i++) {
    const key = children[i].props?.key;
    if (key) map[key] = i;
  }
  return map;
};

const determineCommitFlag = (
  parentFiber: Fiber,
  newFiber: Fiber,
  oldFiber: Fiber,
  flag?: FLAG
) => {
  /**
   * the nearest parent component fiber
   */
  const nearestComponent = isComponent(parentFiber)
    ? parentFiber
    : findToRoot(parentFiber, (fiber) => isComponent(fiber));

  /**
   * when nearest parent component fiber with FLAG.UPDATE commitFlag, it should be FLAG.UPDATE.
   */
  let commitFlag =
    !matchFlag(nearestComponent?.commitFlag, FLAG.UPDATE) &&
    parentFiber.alternate!.childFlag
      ? !oldFiber.childFlag && !oldFiber.flag
        ? FLAG.REUSE
        : oldFiber.flag
      : FLAG.UPDATE;

  /**
   * when memo fiber compare result is true, it should be FLAG.REUSE.
   */
  if (
    isComponent(oldFiber) &&
    !oldFiber.childFlag &&
    !oldFiber.flag &&
    (oldFiber.tag as Function & { compare?: Function }).compare?.(
      newFiber.props,
      oldFiber.props
    )
  ) {
    commitFlag = mergeFlag(commitFlag, FLAG.REUSE);
  }

  if (isElement(newFiber) && matchFlag(commitFlag, FLAG.UPDATE)) {
    let diff = attrDiff(newFiber, oldFiber);
    if (diff.length) {
      newFiber.attrDiff = diff;
    } else {
      commitFlag = clearFlag(commitFlag, FLAG.UPDATE);
    }
  }

  flag && (commitFlag = mergeFlag(commitFlag, flag));

  /**
   * portal don't need commitFlag
   */
  if (isPortal(newFiber)) {
    commitFlag = undefined;
  }

  if (matchFlag(commitFlag, FLAG.REUSE)) {
    commitFlag = clearFlag(commitFlag, FLAG.UPDATE);
  }

  return commitFlag;
};

const getSameNewFiber = (
  parentFiber: Fiber,
  newFiber: Fiber,
  oldFiber: Fiber,
  flag?: FLAG
) => {
  const commitFlag = determineCommitFlag(parentFiber, newFiber, oldFiber, flag);
  return matchFlag(commitFlag, FLAG.REUSE)
    ? reuse(newFiber, oldFiber, commitFlag)
    : clone(newFiber, oldFiber, commitFlag);
};

export const diff = (
  parentFiber: Fiber,
  oldChildren: Fiber[] = [],
  newChildren: Fiber[] = []
) => {
  const { reconcileState } = parentFiber as { reconcileState: ReconcileState };

  let cloneChildren: Fiber[] = [];
  let newStartIndex = 0;
  let newEndIndex = newChildren.length - 1;
  let oldStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;

  let newStartFiber = newChildren[newStartIndex];
  let newEndFiber = newChildren[newEndIndex];
  let oldStartFiber = oldChildren[oldStartIndex];
  let oldEndFiber = oldChildren[oldEndIndex];

  let preStartFiber: Fiber | undefined;
  let preEndFiber: Fiber | undefined;

  const deletion = (fiber: Fiber) => {
    reconcileState.commitList.push(del(fiber));
  };

  const forward = () => {
    if (preStartFiber) preStartFiber.sibling = newStartFiber;
    newStartFiber.parent = parentFiber;
    newStartFiber.index = newStartIndex;
    newStartFiber.reconcileState = reconcileState;
    preStartFiber = newStartFiber;
    cloneChildren[newStartIndex] = newStartFiber;
    newStartFiber = newChildren[++newStartIndex];
  };

  const forwardEnd = () => {
    if (preEndFiber) newEndFiber.sibling = preEndFiber;
    newEndFiber.parent = parentFiber;
    newEndFiber.index = newEndIndex;
    newEndFiber.reconcileState = reconcileState;
    preEndFiber = newEndFiber;
    cloneChildren[newEndIndex] = newEndFiber;
    newEndFiber = newChildren[--newEndIndex];
  };

  let keyIndexMap: any;

  while (newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
    if (oldStartFiber === undefined) {
      oldStartFiber = oldChildren[++oldStartIndex];
    } else if (oldEndFiber === undefined) {
      oldStartFiber = oldChildren[--oldEndIndex];
    } else if (isSame(newStartFiber, oldStartFiber)) {
      newStartFiber = getSameNewFiber(
        parentFiber,
        newStartFiber,
        oldStartFiber
      );
      forward();
      oldStartFiber = oldChildren[++oldStartIndex];
    } else if (isSame(newEndFiber, oldEndFiber)) {
      newEndFiber = getSameNewFiber(parentFiber, newEndFiber, oldEndFiber);
      forwardEnd();
      oldEndFiber = oldChildren[--oldEndIndex];
    } else if (isSame(newStartFiber, oldEndFiber)) {
      newStartFiber = getSameNewFiber(
        parentFiber,
        newStartFiber,
        oldEndFiber,
        FLAG.INSERT
      );
      forward();
      oldEndFiber = oldChildren[--oldEndIndex];
    } else if (isSame(newEndFiber, oldStartFiber)) {
      newEndFiber = getSameNewFiber(
        parentFiber,
        newEndFiber,
        oldStartFiber,
        FLAG.INSERT
      );
      forwardEnd();
      oldStartFiber = oldChildren[++oldStartIndex];
    } else {
      if (!keyIndexMap) {
        keyIndexMap = keyIndexMapGen(oldChildren, oldStartIndex, oldEndIndex);
      }
      const index = keyIndexMap[newStartFiber.props.key];
      if (isNaN(index)) {
        newStartFiber = create(newStartFiber, parentFiber);
      } else {
        const targetFiber = oldChildren[index];
        const same = isSame(newStartFiber, targetFiber);
        newStartFiber = same
          ? getSameNewFiber(
              parentFiber,
              newStartFiber,
              targetFiber,
              FLAG.INSERT
            )
          : create(newStartFiber, parentFiber);
        !same && deletion(targetFiber);
        oldChildren[index] = undefined as unknown as Fiber;
      }
      forward();
    }
  }

  if (oldStartIndex > oldEndIndex) {
    newChildren.slice(newStartIndex, newEndIndex + 1).forEach((fiber) => {
      newStartFiber = create(
        newStartFiber,
        parentFiber,
        reconcileState.hydrate
      );
      forward();
    });
  } else if (newStartIndex > newEndIndex) {
    oldChildren
      .slice(oldStartIndex, oldEndIndex + 1)
      .forEach((fiber) => fiber && deletion(fiber));
  }

  if (preStartFiber && preEndFiber) preStartFiber.sibling = preEndFiber;

  parentFiber.child = cloneChildren[0];
  parentFiber.children = cloneChildren;
};
