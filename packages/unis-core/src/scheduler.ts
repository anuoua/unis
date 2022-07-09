export type Task = Function & { isMacro?: any };

const INTERVAL = 4;

let lastTime: number = 0;
let looping = false;

const macroTaskQueue: Task[] = [];
const microTaskQueue: Task[] = [];

const pickTask = () => {
  const microTask = microTaskQueue.shift();
  if (microTask) return microTask;
  const macroTask = macroTaskQueue.shift();
  if (macroTask) return macroTask;
};

const loop = (task: Task): void => {
  looping = true;
  runTask(task);
  const nextTask = pickTask();
  if (nextTask) {
    if (shouldYield() || nextTask.isMacro) {
      nextTick(() => loop(nextTask), nextTask.isMacro);
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

export const addMacroTask = (task: Task, pending = false) => {
  task.isMacro = true;
  looping
    ? macroTaskQueue.push(task)
    : pending
    ? nextTick(() => loop(task))
    : loop(task);
};

export const addMicroTask = (task: Task) => {
  looping && microTaskQueue.push(task);
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
