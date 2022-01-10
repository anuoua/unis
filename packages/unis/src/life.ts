import { DebuggerEvent } from "@vue/reactivity";
import { getCurrentVode, Vode } from "./vode";

export function regist(key: string, callback: Function) {
  const currentVode = getCurrentVode();
  if (!currentVode) {
    throw new Error("Don't call the life cycle api outside the component!");
  } else {
    if (currentVode.life[key]) {
      currentVode.life[key].push(callback);
    } else {
      currentVode.life[key] = [callback];
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

export function onRenderTracked(callback: (e: DebuggerEvent) => void) {
  regist(onRenderTracked.name, callback);
}

export function onRenderTriggered(callback: (e: DebuggerEvent) => void) {
  regist(onRenderTriggered.name, callback);
}

export function onErrorCaptured(callback: (e: any, vode: Vode) => void) {
  regist(onErrorCaptured.name, callback);
}
