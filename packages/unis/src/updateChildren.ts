import { isSameVode, rEach } from "./utils";
import { FragmentVode } from "./vode";
import { insertBefore, nextSibline, prepend, removeElements } from "./dom";
import { ParentVode, Vode } from "./vode";
import { onBeforeUnmount, onMounted } from "./life";

function findElsInEntityVode(
  children: Vode[],
  fromIndex: number,
  direction: "after" | "pre"
) {
  for (
    let i = fromIndex;
    direction === "pre" ? i >= 0 : i < children.length;
    direction === "pre" ? i-- : i++
  ) {
    const vode = children[i];
    const entityEls = vode.getEntityEls();
    if (vode.isMounted && entityEls.length) {
      return entityEls;
    }
  }

  return [];
}

function syncVodeEls(
  parentVode: ParentVode,
  newChildren: Vode[],
  newVodeIndex: number,
  direction: "after" | "pre",
  insertVode?: Vode
) {
  const targetVode = insertVode ?? newChildren[newVodeIndex];

  if (direction === "pre") {
    const preVodeEls = findElsInEntityVode(
      newChildren,
      newVodeIndex - 1,
      direction
    );
    if (!preVodeEls[0]) {
      prepend(parentVode.getContainerEl(), ...targetVode.getEntityEls());
    } else {
      insertBefore(
        parentVode.getContainerEl(),
        targetVode.getEntityEls(),
        nextSibline(preVodeEls.pop())
      );
    }
  } else {
    insertBefore(
      parentVode.getContainerEl(),
      targetVode.getEntityEls(),
      findElsInEntityVode(newChildren, newVodeIndex + 1, direction)[0]
    );
  }
}

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

  syncVodeEls(parentVode, newChildren, insertIndex, "pre", utilVode);

  for (const vode of insertChildren) {
    vode.parentVode = parentVode;
    vode.depth--;
  }

  afterMountVode(utilVode);
}

function removeVodes(parentVode: ParentVode, removeChildren: Vode[]) {
  const utilVode = new FragmentVode({}, removeChildren);

  const { componentList, teleportList } = utilVode.walkTree();

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
  const { componentList, teleportList } = vode.walkTree((vode) => {
    vode.isMounted = true;
  });

  for (let teleport of teleportList) {
    teleport.mount();
  }

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
    } else if (isSameVode(newStartVode, oldStartVode)) {
      oldStartVode.patch(newStartVode as any);
      newChildren[newStart] = oldStartVode;
      oldStartVode = oldChildren[++oldStart];
      newStartVode = newChildren[++newStart];
    } else if (isSameVode(newEndVode, oldEndVode)) {
      oldEndVode.patch(newEndVode as any);
      newChildren[newEnd] = oldEndVode;
      oldEndVode = oldChildren[--oldEnd];
      newEndVode = newChildren[--newEnd];
    } else if (isSameVode(newStartVode, oldEndVode)) {
      oldEndVode.patch(newStartVode as any);
      newChildren[newStart] = oldEndVode;
      syncVodeEls(parentVode, newChildren, newStart, "pre");
      oldEndVode = oldChildren[--oldEnd];
      newStartVode = newChildren[++newStart];
    } else if (isSameVode(newEndVode, oldStartVode)) {
      oldStartVode.patch(newEndVode as any);
      newChildren[newEnd] = oldStartVode;
      syncVodeEls(parentVode, newChildren, newEnd, "after");
      oldStartVode = oldChildren[++oldStart];
      newEndVode = newChildren[--newEnd];
    } else {
      if (!keyIndexMap)
        keyIndexMap = keyIndexMapGen(oldChildren, oldStart, oldEnd);
      const newStartKey = newStartVode.props?.key;
      const indexInOld = keyIndexMap[newStartKey];
      if (isNaN(indexInOld)) {
        insertVodes(parentVode, newChildren, [newStartVode], newStart);
      } else {
        let targetVode = oldChildren[indexInOld];
        if (isSameVode(newStartVode, targetVode)) {
          targetVode.patch(newStartVode as any);
          newChildren[newStart] = targetVode;
          oldChildren[indexInOld] = undefined as unknown as Vode;
          syncVodeEls(parentVode, newChildren, newStart, "pre");
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
