export type Task = Function & { id?: any };

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

const loop = () => {
  looping = true;
  let task: Task | undefined;
  while ((task = pickTask())) {
    runTask(task);
    if (shouldYield()) {
      return nextTick(() => loop());
    }
  }
  looping = false;
};

const runTask = (task: Task) => {
  lastTime = performance.now();
  return task();
};

export const addMacroTask = (task: Task) => {
  macroTaskQueue.push(task);
  !looping && loop();
};

export const addMicroTask = (task: Task) => {
  microTaskQueue.push(task);
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
