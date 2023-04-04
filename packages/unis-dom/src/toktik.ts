export type Task = Function & { isTok?: any };

export const createTokTik = () => {
  const INTERVAL = 4;

  let lastTime: number = 0;
  let looping = false;

  const tikQueue: Task[] = [];
  const tokQueue: Task[] = [];

  const next = () => tikQueue[0] ?? tokQueue[0];

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

  const addTok = (task: Task, pending = false) => {
    task.isTok = true;
    looping
      ? tokQueue.push(task)
      : pending
      ? nextTick(() => loop(task), pending)
      : loop(task);
  };

  const addTik = (task: Task) => {
    looping && tikQueue.push(task);
  };

  const clearTikTaskQueue = () => (tikQueue.length = 0);

  const shouldYield = () => performance.now() - lastTime > INTERVAL;

  const nextTick = (cb: VoidFunction, pending = false) => {
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

  return {
    addTok,
    addTik,
    clearTikTaskQueue,
    shouldYield,
  };
};
