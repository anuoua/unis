import { readyForWork, createRoot, createTokTik } from "@unis/core";
import { createOperator } from "./operator";
import { UNIS_ROOT } from "./const";
import { nextTick, now } from "./toktik";

const operator = createOperator();
const toktik = createTokTik({
  now,
  nextTick,
  interval: (window as any).UNIS_INTERVAL,
});

export const render = (element: any, container: Element, hydrate = false) => {
  (container as any)[UNIS_ROOT] = true;
  const rootFiber = createRoot(element, container);
  rootFiber.runtime = {
    toktik,
    operator,
  };
  readyForWork(rootFiber, hydrate);
};
