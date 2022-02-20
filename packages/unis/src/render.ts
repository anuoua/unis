import { trigger } from "./schedule";

export const render = (element: any, container: Element) => {
  trigger({
    type: container.tagName.toLocaleLowerCase(),
    el: container,
    props: {
      children: [].concat(element),
    },
  });
};
