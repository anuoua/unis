export type Task = Function & { isTok?: any };

const INTERVAL = 4;

let lastTime: number = 0;
let looping = false;

const tikQueue: Task[] = [];
const tokQueue: Task[] = [];

const next = () => tikQueue.at(-1) ?? tokQueue.at(-1);

const pick = () => tikQueue.shift() ?? tokQueue.shift();

const loop = (task: Task): void => {
  looping = true;
  runTask(task);
  const nextTask = next();
  if (nextTask) {
    if (shouldYield() || nextTask.isTok) {
      nextTick(() => loop(pick()!), nextTask.isTok);
    } else {
      loop(pick()!);
    }
    return;
  }
  looping = false;
};

const runTask = (task: Task) => {
  lastTime = performance.now();
  return task();
};

export const addTok = (task: Task, pending = false) => {
  task.isTok = true;
  looping
    ? tokQueue.push(task)
    : pending
    ? nextTick(() => loop(task), pending)
    : loop(task);
};

export const addTik = (task: Task) => {
  looping && tikQueue.push(task);
};

export const clearTikTaskQueue = () => (tikQueue.length = 0);

export const shouldYield = () => performance.now() - lastTime > INTERVAL;

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
