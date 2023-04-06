export const nextTick = (cb: VoidFunction, pending = false) => {
  if (pending) {
    queueMicrotask(cb);
  } else if (window.MessageChannel) {
    const { port1, port2 } = new window.MessageChannel();
    port1.postMessage("");
    port2.onmessage = () => cb();
  } else {
    setTimeout(() => cb());
  }
};

export const now = () => performance.now();
