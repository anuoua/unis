import { afterMountVode } from "./updateChildren";
import { ElementVode } from "./vode";

export function render(vode: any, el: Node | null) {
  const rootVode = {
    el,
    depth: 0,
    index: 0,
    isMounted: true,
    getContainerEl: () => el,
  } as ElementVode;
  vode.create(rootVode, 0);
  vode.mount();

  afterMountVode([vode]);
}
