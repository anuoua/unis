const INTERVAL = 4;

let lastTime: number = 0;
let looping = false;

const taskQueue: Function[] = [];

const loop = () => {
  looping = true;
  let task: Function | undefined;
  while ((task = taskQueue.shift())) {
    runTask(task);
    if (shouldYield()) {
      return nextTick(() => loop());
    }
  }
  looping = false;
};

const runTask = (task: Function) => {
  lastTime = performance.now();
  return task();
};

export const addTask = (task: Function) => {
  taskQueue.push(task);
  !looping && loop();
};

export const shouldYield = () => performance.now() - lastTime > INTERVAL;

const nextTick = (cb: Function) => {
  if (window.MessageChannel) {
    const { port1, port2 } = new window.MessageChannel();
    port1.postMessage("");
    port2.onmessage = () => cb();
  } else {
    setTimeout(() => cb());
  }
};
