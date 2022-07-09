export type Task = Function & { isTok?: any };

const INTERVAL = 4;

let lastTime: number = 0;
let looping = false;

const tokQueue: Task[] = [];
const tikQueue: Task[] = [];

const pickTask = () => {
  const tik = tikQueue.shift();
  if (tik) return tik;
  const tok = tokQueue.shift();
  if (tok) return tok;
};

const loop = (task: Task): void => {
  looping = true;
  runTask(task);
  const nextTask = pickTask();
  if (nextTask) {
    if (shouldYield() || nextTask.isTok) {
      nextTick(() => loop(nextTask), nextTask.isTok);
    } else {
      loop(nextTask);
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
    ? nextTick(() => loop(task))
    : loop(task);
};

export const addTik = (task: Task) => {
  looping && tikQueue.push(task);
};

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
