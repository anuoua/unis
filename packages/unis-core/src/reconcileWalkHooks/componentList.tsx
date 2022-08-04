import { isComponent, WalkHook } from "../fiber";

export const componentListWalkHook: WalkHook = {
  down(from) {
    if (isComponent(from)) {
      from.reconcileState!.componentList.push(from);
    }
  },
  up(from, to) {
    if (to && isComponent(to)) {
      from.reconcileState!.componentList.pop();
    }
  },
};
