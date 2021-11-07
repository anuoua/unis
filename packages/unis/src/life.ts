import { ComponentVode } from "./vode";

let currentComponentVode: ComponentVode | null = null;

export function getCurrentComponentVode() {
  return currentComponentVode;
}

export function setCurrentComponentVode(vode: ComponentVode | null) {
  currentComponentVode = vode;
}

export function regist(key: string, callback: Function) {
  if (!currentComponentVode) {
    throw new Error("Don't call the life cycle api outside the component!");
  } else {
    if (currentComponentVode.life[key]) {
      currentComponentVode.life[key].push(callback);
    } else {
      currentComponentVode.life[key] = [callback];
    }
  }
}

export function onBeforeMount(callback: Function) {
  regist(onBeforeMount.name, callback);
}

export function onMounted(callback: Function) {
  regist(onMounted.name, callback);
}

export function onBeforeUpdate(callback: Function) {
  regist(onBeforeUpdate.name, callback);
}

export function onUpdated(callback: Function) {
  regist(onUpdated.name, callback);
}

export function onBeforeUnmount(callback: Function) {
  regist(onBeforeUnmount.name, callback);
}

export function onUnmounted(callback: Function) {
  regist(onUnmounted.name, callback);
}

// onErrorCaptured
// onRenderTracked
// onRenderTriggered
// onActivated
// onDeactivated
