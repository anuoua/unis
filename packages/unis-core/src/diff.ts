import { createElement } from "./dom";
import {
  clearFlag,
  createFiber,
  Fiber,
  FLAG,
  isDOM,
  matchFlag,
  isMemo,
  isPortal,
  isSame,
  mergeFlag,
  isComponent,
} from "./fiber";
import { classes, isNullish, isStr, keys, styleStr, svgKey } from "./utils";

export type AttrDiff = [string, any, any][];

export const attrDiff = (
  newFiber: Record<string, any>,
  oldFiber: Record<string, any>
) => {
  const diff: AttrDiff = [];
  const newProps = newFiber.props;
  const oldProps = oldFiber.props;

  const getRealAttr = (attr: string) =>
    attr === "className"
      ? "class"
      : newFiber.isSVG
      ? svgKey(attr)
      : attr.toLowerCase();

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

  for (const key of new Set([...keys(newProps), ...keys(oldProps)])) {
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
  createFiber({
    ...newFiber,
    commitFlag,
    alternate: oldFiber,
    ...(isComponent(newFiber)
      ? {
          renderFn: oldFiber.renderFn,
          rendered: oldFiber.rendered,
          stateEffects: oldFiber.stateEffects,
          effects: oldFiber.effects,
          layoutEffects: oldFiber.layoutEffects,
          id: oldFiber.id,
        }
      : undefined),
    ...(isDOM(newFiber)
      ? { el: oldFiber.el, isSVG: oldFiber.isSVG }
      : undefined),
    ...(isPortal(newFiber) ? { to: oldFiber.to } : undefined),
  });

export const reuse = (newFiber: Fiber, oldFiber: Fiber, commitFlag?: FLAG) =>
  createFiber({
    ...newFiber,
    commitFlag,
    alternate: oldFiber,
  });

export const del = (oldFiber: Fiber): Fiber => ({
  commitFlag: FLAG.DELETE,
  alternate: oldFiber,
});

export const create = (newFiber: Fiber, parentFiber: Fiber) => {
  const retFiber = createFiber({
    ...newFiber,
    commitFlag: FLAG.CREATE,
  });

  if (isDOM(newFiber)) {
    retFiber.isSVG = newFiber.tag === "svg" || parentFiber.isSVG;
    retFiber.el = createElement({ ...retFiber });
    const diff = attrDiff(retFiber, { props: {} });
    retFiber.attrDiff = diff;
    if (diff.length > 0)
      retFiber.commitFlag = mergeFlag(retFiber.commitFlag, FLAG.UPDATE);
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

export const diff = (
  parentFiber: Fiber,
  oldChildren: Fiber[] = [],
  newChildren: Fiber[] = []
) => {
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
    parentFiber.reconcileState!.effectList.push(del(fiber));
  };

  const forward = () => {
    if (preStartFiber) preStartFiber.sibling = newStartFiber;
    newStartFiber.parent = parentFiber;
    newStartFiber.index = newStartIndex;
    newStartFiber.reconcileState = parentFiber.reconcileState;
    preStartFiber = newStartFiber;
    cloneChildren[newStartIndex] = newStartFiber;
    newStartFiber = newChildren[++newStartIndex];
  };

  const forwardEnd = () => {
    if (preEndFiber) newEndFiber.sibling = preEndFiber;
    newEndFiber.parent = parentFiber;
    newEndFiber.index = newEndIndex;
    newEndFiber.reconcileState = parentFiber.reconcileState;
    preEndFiber = newEndFiber;
    cloneChildren[newEndIndex] = newEndFiber;
    newEndFiber = newChildren[--newEndIndex];
  };

  const determineCommitFlag = (
    newFiber: Fiber,
    oldFiber: Fiber,
    flag?: FLAG
  ) => {
    let commitFlag =
      // when diff in an commitFlag FLAG.UPDATE component, it should be FLAG.UPDATE.
      !matchFlag(
        parentFiber.reconcileState!.componentList.at(-1)?.commitFlag,
        FLAG.UPDATE
      ) && parentFiber.alternate!.childFlag
        ? !oldFiber.childFlag && !oldFiber.flag
          ? FLAG.REUSE
          : oldFiber.flag
        : FLAG.UPDATE;

    // when memo fiber compare result is true, it should be FLAG.REUSE.
    if (
      isMemo(oldFiber) &&
      !oldFiber.childFlag &&
      oldFiber.compare?.(newFiber.props, oldFiber.props)
    ) {
      commitFlag = mergeFlag(commitFlag, FLAG.REUSE);
    }

    if (isDOM(newFiber)) {
      let diff: AttrDiff = [];
      if (matchFlag(commitFlag, FLAG.UPDATE)) {
        diff = attrDiff(newFiber, oldFiber);
        if (diff.length === 0) commitFlag = clearFlag(commitFlag, FLAG.UPDATE);
      }
      newFiber.attrDiff = diff;
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

  const getSameNewFiber = (newFiber: Fiber, oldFiber: Fiber, flag?: FLAG) => {
    const commitFlag = determineCommitFlag(newFiber, oldFiber, flag);
    return matchFlag(commitFlag, FLAG.REUSE)
      ? reuse(newFiber, oldFiber, commitFlag)
      : clone(newFiber, oldFiber, commitFlag);
  };

  let keyIndexMap: any;

  while (newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
    if (oldStartFiber === undefined) {
      oldStartFiber = oldChildren[++oldStartIndex];
    } else if (oldEndFiber === undefined) {
      oldStartFiber = oldChildren[--oldEndIndex];
    } else if (isSame(newStartFiber, oldStartFiber)) {
      newStartFiber = getSameNewFiber(newStartFiber, oldStartFiber);
      forward();
      oldStartFiber = oldChildren[++oldStartIndex];
    } else if (isSame(newEndFiber, oldEndFiber)) {
      newEndFiber = getSameNewFiber(newEndFiber, oldEndFiber);
      forwardEnd();
      oldEndFiber = oldChildren[--oldEndIndex];
    } else if (isSame(newStartFiber, oldEndFiber)) {
      newStartFiber = getSameNewFiber(newStartFiber, oldEndFiber, FLAG.INSERT);
      forward();
      oldEndFiber = oldChildren[--oldEndIndex];
    } else if (isSame(newEndFiber, oldStartFiber)) {
      newEndFiber = getSameNewFiber(newEndFiber, oldStartFiber, FLAG.INSERT);
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
          ? getSameNewFiber(newStartFiber, targetFiber, FLAG.INSERT)
          : create(newStartFiber, parentFiber);
        !same && deletion(targetFiber);
        oldChildren[index] = undefined as unknown as Fiber;
      }
      forward();
    }
  }

  if (oldStartIndex > oldEndIndex) {
    newChildren.slice(newStartIndex, newEndIndex + 1).forEach((fiber) => {
      newStartFiber = create(newStartFiber, parentFiber);
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
