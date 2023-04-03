import { toArray } from "../utils";
import { ELEMENT } from "../fiber";
import { readyForWork } from "../reconcile";
import { createTokTik } from "./toktik";
import { createOperator } from "./operator";

const toktik = createTokTik();
const operator = createOperator();

export const UNIS_ROOT = Symbol("unis_root");

export const render = (element: any, container: Element, hydrate = false) => {
  (container as any)[UNIS_ROOT] = true;
  readyForWork(
    {
      tag: container.tagName.toLocaleLowerCase(),
      type: ELEMENT,
      el: container,
      index: 0,
      props: {
        children: toArray(element),
      },
      runtime: {
        toktik,
        operator,
      },
    },
    hydrate
  );
};
