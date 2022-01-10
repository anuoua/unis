import { isSameVode, rEach } from "./utils";
import {
  ComponentVode,
  getEntityEls,
  TeleportVode,
  walkVodesLayer,
} from "./vode";
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
    const entityEls = getEntityEls([vode]);
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
  insertVodes?: Vode[]
) {
  const targetVodes = insertVodes ?? [newChildren[newVodeIndex]];
  let insertTargetEl: Node | null;

  if (direction === "pre") {
    const preVodeEls = findElsInEntityVode(
      newChildren,
      newVodeIndex - 1,
      direction
    );
    preVodeEls[0]
      ? (insertTargetEl = nextSibline(preVodeEls.pop()!))
      : prepend(parentVode.getContainerEl(), ...getEntityEls(targetVodes));
  } else {
    insertTargetEl = findElsInEntityVode(
      newChildren,
      newVodeIndex + 1,
      direction
    )[0];
  }

  if (insertTargetEl!) {
    insertBefore(
      parentVode.getContainerEl(),
      getEntityEls(targetVodes),
      insertTargetEl
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
  insertChildren.forEach((vode, index) => {
    vode.create(parentVode, index);
  });
  syncVodeEls(parentVode, newChildren, insertIndex, "pre", insertChildren);
  afterMountVode(insertChildren);
}

function removeVodes(parentVode: ParentVode, removeChildren: Vode[]) {
  const comps: ComponentVode[] = [];
  const teleportList: TeleportVode[] = [];

  walkVodesLayer(removeChildren, (vode: Vode) => {
    if (vode instanceof ComponentVode) comps.push(vode);
    if (vode instanceof TeleportVode) teleportList.push(vode);
  });

  // call onBeforeUnmount life
  for (const comp of comps) {
    comp.callLife(onBeforeUnmount.name);
  }

  // unmount teleport elements
  rEach(teleportList, (teleport) => {
    teleport.unmount();
    teleport.isMounted = false;
  });

  // unmount all entity elements
  removeElements(getEntityEls(removeChildren));

  // unmount components (call onUnmounted life & clear)
  rEach(comps, (comp) => {
    comp.unmount();
    comp.isMounted = false;
  });
}

export function afterMountVode(vodes: Vode[]) {
  const comps: ComponentVode[] = [];
  const teleportList: TeleportVode[] = [];

  walkVodesLayer(vodes, (vode: Vode) => {
    vode.isMounted = true;
    if (vode instanceof ComponentVode) comps.push(vode);
    if (vode instanceof TeleportVode) teleportList.push(vode);
  });

  for (let teleport of teleportList) {
    teleport.mount();
  }

  rEach(comps, (comp) => {
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
