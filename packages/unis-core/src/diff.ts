import { createElement } from "./dom";
import { Fiber, FLAG, isElement, isMemoWrap, isPortal, isSame } from "./fiber";
import {
  classes,
  isNullish,
  isStr,
  keys,
  picks,
  styleStr,
  svgKey,
} from "./utils";

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

const handleElementFiber = (retFiber: Fiber, oldFiber: Fiber): Fiber => {
  const diff = attrDiff(retFiber, oldFiber);
  const commitFlag =
    retFiber.commitFlag === FLAG.UPDATE && diff.length === 0
      ? undefined
      : retFiber.commitFlag;
  return { ...retFiber, commitFlag, attrDiff: diff };
};

const handlePortalFiber = (retFiber: Fiber): Fiber => ({
  ...retFiber,
  commitFlag: undefined,
});

const handleMemoFiber = (retFiber: Fiber, oldFiber: Fiber) => {
  if (
    !oldFiber.childFlag &&
    retFiber.commitFlag !== FLAG.CREATE &&
    retFiber.rendered?.[0].compare?.(retFiber.props, oldFiber.props)
  )
    retFiber.commitFlag = FLAG.REUSE;
  return retFiber;
};

export const clone = (newFiber: Fiber, oldFiber: Fiber, flag?: FLAG) => {
  const retFiber: Fiber = {
    ...newFiber,
    ...picks(oldFiber, [
      "renderFn",
      "rendered",
      "stateEffects",
      "effects",
      "to",
      "el",
      "isSVG",
      "index",
      "id",
    ]),
    commitFlag: flag,
    alternate: oldFiber,
  };
  return isElement(retFiber)
    ? handleElementFiber(retFiber, oldFiber)
    : isPortal(retFiber)
    ? handlePortalFiber(retFiber)
    : isMemoWrap(retFiber)
    ? handleMemoFiber(retFiber, oldFiber)
    : retFiber;
};

export const reuse = (oldFiber: Fiber) =>
  ({ commitFlag: FLAG.REUSE, alternate: oldFiber } as Fiber);

export const create = (newFiber: Fiber, parentFiber: Fiber) => {
  const isSVG = newFiber.type === "svg" || parentFiber.isSVG;
  const retFiber = {
    ...newFiber,
    isSVG,
    el: isElement(newFiber) ? createElement({ ...newFiber, isSVG }) : undefined,
    commitFlag: isPortal(newFiber) ? undefined : FLAG.CREATE,
  } as Fiber;
  retFiber.attrDiff = attrDiff(retFiber, { props: {} });
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
    fiber.commitFlag = FLAG.DELETE;
    parentFiber.reconcileState!.effectList.push(fiber);
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

  let keyIndexMap: any;

  while (newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
    if (oldStartFiber === undefined) {
      oldStartFiber = oldChildren[++oldStartIndex];
    } else if (oldEndFiber === undefined) {
      oldStartFiber = oldChildren[--oldEndIndex];
    } else if (isSame(newStartFiber, oldStartFiber)) {
      // when parent fiber has childFlag and fiber no childFlag, we should reuse it.

      const flag = parentFiber.alternate?.childFlag
        ? !oldStartFiber.childFlag && !oldStartFiber.flag
          ? FLAG.REUSE
          : oldStartFiber.flag
        : FLAG.UPDATE;

      if (flag === FLAG.REUSE) {
        newStartFiber = reuse(oldStartFiber);
      } else {
        newStartFiber = clone(newStartFiber, oldStartFiber, flag);
      }

      forward();
      oldStartFiber = oldChildren[++oldStartIndex];
    } else if (isSame(newEndFiber, oldEndFiber)) {
      newEndFiber = clone(newEndFiber, oldEndFiber, FLAG.UPDATE);
      forwardEnd();
      oldEndFiber = oldChildren[--oldEndIndex];
    } else if (isSame(newStartFiber, oldEndFiber)) {
      newStartFiber = clone(newStartFiber, oldEndFiber, FLAG.INSERT);
      forward();
      oldEndFiber = oldChildren[--oldEndIndex];
    } else if (isSame(newEndFiber, oldStartFiber)) {
      newEndFiber = clone(newEndFiber, oldStartFiber, FLAG.INSERT);
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
          ? clone(newStartFiber, targetFiber, FLAG.INSERT)
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
