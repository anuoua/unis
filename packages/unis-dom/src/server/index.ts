import { createRoot, createTokTik, readyForWork } from "@unis/core";
import { createOperator, ElementNode } from "./operator";

const operator = createOperator();

const toktik = createTokTik({
  nextTick: (cb: VoidFunction) =>
    Promise.resolve()
      .catch((err) => console.error(err))
      .then(() => cb()),
  now: () => 0,
});

export const renderToString = (element: any) => {
  const rootNode = new ElementNode("");
  const rootFiber = createRoot(element, rootNode);
  rootFiber.runtime = {
    toktik,
    operator,
  };
  readyForWork(rootFiber);
  return rootNode.renderToString();
};
