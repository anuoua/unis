import { readyForWork, createRoot, createTokTik } from "@unis/core";
import { createOperator } from "../src/operator";

const toktik = createTokTik({
  nextTick: (cb: VoidFunction) =>
    Promise.resolve()
      .catch((err) => console.error(err))
      .then(() => cb()),
  now: () => 0,
});
const operator = createOperator();

export const testRender = (
  element: any,
  container: Element,
  hydrate = false
) => {
  const rootFiber = createRoot(element, container);
  rootFiber.runtime = {
    toktik,
    operator,
  };
  readyForWork(rootFiber, hydrate);
};

export const rendered = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
