import { readyForWork, createRoot } from "@unis/core";
import { createTokTik } from "./toktik";
import { createOperator } from "./operator";
import { UNIS_ROOT } from "./const";

const operator = createOperator();
const toktik = createTokTik();

export const render = (element: any, container: Element, hydrate = false) => {
  (container as any)[UNIS_ROOT] = true;
  const rootFiber = createRoot(element, container);
  rootFiber.runtime = {
    toktik,
    operator,
  };
  readyForWork(rootFiber, hydrate);
};
