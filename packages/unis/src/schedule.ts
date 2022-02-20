import { Fiber } from "./fiber";
import { startWork } from "./reconcile";

let lastTime: number;
const interval = 14;

export const trigger = (fiber: Fiber) => {
  lastTime = performance.now();
  startWork(fiber);
};

export const triggerDebounce = (() => {
  let pending = false;
  return (fiber: Fiber) => {
    if (pending) return;
    pending = true;
    queueMicrotask(() => {
      pending = false;
      trigger(fiber);
    });
  };
})();

export const shouldYield = () => performance.now() - lastTime > interval;

export const nextTick = (cb: Function) => {
  const cbWrap = () => {
    lastTime = performance.now();
    cb();
  };
  if (window.MessageChannel) {
    const { port1, port2 } = new window.MessageChannel();
    port1.postMessage("");
    port2.onmessage = () => cbWrap();
  } else {
    setTimeout(() => cbWrap());
  }
};
