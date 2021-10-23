import { isSameVode, rEach } from "./utils";
import { FragmentVode } from "./vode";
import { insertBefore, nextSibline, removeElements } from "./dom";
import { ParentVode, Vode } from "./type";
import { onBeforeUnmount, onMounted } from "./life";

function keyIndexMapGen(children: Vode[], begin: number, end: number) {
  const map: any = {};
  for (let i = begin; i <= end; i++) {
    const key = children[i].props?.key;
    if (key) map[key] = i;
  }
  return map;
}

function insertVodes(
  parentVode: ParentVode,
  newChildren: Vode[],
  insertChildren: Vode[],
  insertIndex: number
) {
  const utilVode = new FragmentVode({}, insertChildren);
  utilVode.create(parentVode);

  insertBefore(
    parentVode.getContainerEl(),
    [utilVode.el],
    nextSibline(newChildren[insertIndex - 1]?.getEntityEls().pop())
  );

  for (const vode of insertChildren) {
    vode.parentVode = parentVode;
    vode.depth--;
  }

  afterMountVode(utilVode);
}

function removeVodes(parentVode: ParentVode, removeChildren: Vode[]) {
  const utilVode = new FragmentVode({}, removeChildren);

  const { componentList, teleportList } = utilVode.getWalkedVodes();

  // call onBeforeUnmount life
  for (const comp of componentList) {
    comp.callLife(onBeforeUnmount.name);
  }

  // unmount teleport elements
  rEach(teleportList, (teleport) => {
    teleport.unmount();
  });

  // unmount all entity elements
  removeElements(utilVode.getEntityEls());

  // unmount components (call onUnmounted life & clear)
  rEach(componentList, (comp) => {
    comp.unmount();
  });
}

export function afterMountVode(vode: Vode) {
  const { componentList } = vode.getWalkedVodes();

  rEach(componentList, (comp) => {
    comp.callLife(onMounted.name);
  });
}

export function updateChildren(
  oldChildren: Vode[],
  newChildren: Vode[],
  parentVode: ParentVode
) {
  let keyIndexMap: any;

  let newStart = 0;
  let newEnd = newChildren.length - 1;
  let oldStart = 0;
  let oldEnd = oldChildren.length - 1;

  let newStartVode = newChildren[newStart];
  let newEndVode = newChildren[newEnd];
  let oldStartVode = oldChildren[oldStart];
  let oldEndVode = oldChildren[oldEnd];

  while (newStart <= newEnd && oldStart <= oldEnd) {
    if (oldStartVode === undefined) {
      oldStartVode = oldChildren[++oldStart];
    } else if (oldEndVode === undefined) {
      oldEndVode = oldChildren[--oldEnd];
    } else if (isSameVode(oldStartVode, newStartVode)) {
      oldStartVode.patch(newStartVode as any);
      newChildren[newStart] = oldStartVode;
      oldStartVode = oldChildren[++oldStart];
      newStartVode = newChildren[++newStart];
    } else if (isSameVode(oldEndVode, newEndVode)) {
      oldEndVode.patch(newEndVode as any);
      newChildren[newEnd] = oldEndVode;
      oldEndVode = oldChildren[--oldEnd];
      newEndVode = newChildren[--newEnd];
    } else if (isSameVode(oldStartVode, newEndVode)) {
      oldStartVode.patch(newEndVode as any);
      newChildren[newEnd] = oldStartVode;
      insertBefore(
        parentVode.getContainerEl(),
        oldStartVode.getEntityEls(),
        nextSibline(oldEndVode.getEntityEls().pop())
      );
      oldStartVode = oldChildren[++oldStart];
      newEndVode = newChildren[--newEnd];
    } else if (isSameVode(oldEndVode, newStartVode)) {
      oldEndVode.patch(newStartVode as any);
      newChildren[newStart] = oldEndVode;
      insertBefore(
        parentVode.getContainerEl(),
        oldEndVode.getEntityEls(),
        oldStartVode.getEntityEls()[0]
      );
      oldEndVode = oldChildren[--oldEnd];
      newStartVode = newChildren[++newStart];
    } else {
      if (!keyIndexMap)
        keyIndexMap = keyIndexMapGen(oldChildren, oldStart, oldEnd);
      const newStartKey = newStartVode.props?.key;
      const indexInOld = keyIndexMap[newStartKey];
      if (isNaN(indexInOld)) {
        insertVodes(parentVode, newChildren, [newStartVode], newStart);
      } else {
        let targetVode = oldChildren[indexInOld];
        if (isSameVode(targetVode, newStartVode)) {
          targetVode.patch(newStartVode as any);
          newChildren[newStart] = targetVode;
          oldChildren[indexInOld] = undefined as unknown as Vode;
          insertBefore(
            parentVode.getContainerEl(),
            targetVode.getEntityEls(),
            oldStartVode.getEntityEls()[0]
          );
        } else {
          insertVodes(parentVode, newChildren, [newStartVode], newStart);
        }
      }
      newStartVode = newChildren[++newStart];
    }
  }

  if (oldStart > oldEnd) {
    const insertChildren = newChildren.slice(newStart, newEnd + 1);
    if (insertChildren.length > 0) {
      insertVodes(parentVode, newChildren, insertChildren, newStart);
    }
  }

  if (newStart > newEnd) {
    const removeChildren = oldChildren
      .slice(oldStart, oldEnd + 1)
      .filter((i) => i);
    removeVodes(parentVode, removeChildren);
  }

  parentVode.children = newChildren;
}
