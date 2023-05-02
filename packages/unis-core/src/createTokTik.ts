export type Task = Function & { isTok?: any };

export const createTokTik = (options: {
  nextTick: (cb: VoidFunction, pending: boolean) => void;
  now: () => number;
  interval?: number;
}) => {
  const { nextTick, now, interval = 4 } = options;

  const timeSlicing = !!interval;

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

  const runTask = timeSlicing
    ? (task: Task) => {
        lastTime = now();
        return task();
      }
    : (task: Task) => task();

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

  const shouldYield = timeSlicing
    ? () => now() - lastTime > interval
    : () => false;

  return {
    addTok,
    addTik,
    clearTikTaskQueue,
    shouldYield,
  };
};
