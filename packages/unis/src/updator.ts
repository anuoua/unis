import { getCurrentVode } from "./vode";

export function forceUpdator() {
  const currentVode = getCurrentVode();
  return () => currentVode?.forceUpdate();
}

export function nextTickUpdator() {
  const currentVode = getCurrentVode();
  return () => currentVode?.nextTickUpdate();
}
