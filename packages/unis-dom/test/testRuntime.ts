import { readyForWork, createRoot } from "@unis/core";
import { Task } from "../src/toktik";
import { createOperator } from "../src/operator";

const createTokTik = () => {
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
        nextTick(() => loop(pick()!));
      } else {
        loop(pick()!);
      }
      return;
    }
    looping = false;
  };

  const runTask = (task: Task) => {
    return task();
  };

  const addTok = (task: Task, pending = false) => {
    task.isTok = true;
    looping
      ? tokQueue.push(task)
      : pending
      ? nextTick(() => loop(task))
      : loop(task);
  };

  const addTik = (task: Task) => {
    looping && tikQueue.push(task);
  };

  const clearTikTaskQueue = () => (tikQueue.length = 0);

  const shouldYield = () => false;

  const nextTick = (cb: VoidFunction) =>
    Promise.resolve()
      .catch((err) => console.error(err))
      .then(() => cb());

  return {
    addTok,
    addTik,
    clearTikTaskQueue,
    shouldYield,
  };
};

const toktik = createTokTik();
const operator = createOperator();

export const testRender = (element: any, container: Element) => {
  const rootFiber = createRoot(element, container);
  rootFiber.runtime = {
    toktik,
    operator,
  };
  readyForWork(rootFiber);
};
