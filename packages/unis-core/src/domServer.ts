import { Fiber, FiberEl, findEls, isText } from "./fiber";
import { Fragment } from "./h";
import { readyForWork } from "./reconcile";
import { isNullish } from "./utils";

export const renderToString = (element: any) => {
  const root = {
    tag: Fragment,
    el: createFragment() as unknown as Element,
    index: 0,
    props: {
      children: [].concat(element),
    },
  } as Fiber;
  readyForWork(root);
  return root;
};

class ElementNode {
  parent: ServerNode | undefined;
  children: ServerNode[] = [];
  constructor(public tag: string) {}
  insertBefore(
    node: ElementNode | TextNode,
    child: ElementNode | TextNode | null
  ) {
    this.children.push(node);
  }
  append(...nodes: ServerNode[]) {
    this.children.push(...nodes);
  }
  renderToString(): string {
    const children = this.children
      .map((child) => child.renderToString())
      .join("");

    return this.tag ? `<${this.tag}>${children}</${this.tag}>` : children;
  }
}

class TextNode {
  constructor(public nodeValue: string) {}
  renderToString() {
    return this.nodeValue;
  }
}

export type ServerNode = ElementNode | TextNode;

export const createFragment = () => new ElementNode("");

export const createElement = (fiber: Fiber) => {
  const { tag } = fiber;
  return isText(fiber)
    ? new TextNode(fiber.props.nodeValue + "")
    : new ElementNode(tag as string);
};

export const insertBefore = (
  container: ElementNode,
  node: ServerNode,
  child: ServerNode | null
) => container.insertBefore(node, child);

export const append = (container: ElementNode, ...nodes: ServerNode[]) =>
  container.append(...nodes);

/**
 * server render only create nextSibling always null
 */
export const nextSibling = (node: ServerNode) => null;

/**
 * server render only create nextSibling always null
 */
export const firstChild = (node: ElementNode) => node.children[0];

export const remove = (fiber: Fiber) =>
  createFragment().append(...(findEls([fiber]) as unknown as ServerNode[]));

export const updateProperties = (fiber: Fiber) => {
  isText(fiber) ? updateTextProperties(fiber) : updateElementProperties(fiber);
};

export const updateTextProperties = (fiber: Fiber) => {
  (fiber.el as unknown as TextNode)!.nodeValue = fiber.props.nodeValue + "";
};

export const updateElementProperties = (fiber: Fiber) => {
  let { el, isSVG, attrDiff: diff } = fiber;

  const setAttr = (el: FiberEl) =>
    isSVG
      ? (el as SVGAElement).setAttributeNS.bind(el, null)
      : (el as HTMLElement).setAttribute.bind(el);

  for (const [key, newValue] of diff || []) {
    const newExist = !isNullish(newValue);
    newExist && setAttr(el!)(key, newValue);
  }
};
