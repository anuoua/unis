import { afterMountVode } from "./updateChildren";
import { ElementVode } from "./vode";

export function render(vode: any, el: Node | null) {
  const rootVode = {
    el,
    depth: 0,
    isMounted: true,
    getContainerEl: () => el,
  } as ElementVode;
  vode.create(rootVode);
  vode.mount();

  afterMountVode(vode);
}
