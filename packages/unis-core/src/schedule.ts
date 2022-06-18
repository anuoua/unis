import { Fiber } from "./fiber";
import { startWork } from "./reconcile";

const INTERVAL = 14;
let lastTime: number;
let pending = false;

export const trigger = (rootFiber: Fiber) => {
  lastTime = performance.now();
  startWork(rootFiber);
};

export const triggerDebounce = (rootFiber: Fiber) => {
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    pending = false;
    trigger(rootFiber);
  });
};

export const shouldYield = () => performance.now() - lastTime > INTERVAL;

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
