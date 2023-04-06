import { isEvent, isNullish, Operator, Fiber, isText } from "@unis/core";

export class ElementNode {
  children: ServerNode[] = [];

  properties: Record<string, string> = {};

  constructor(public tagName: string) {}

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

    const propertiesStr = Object.keys(this.properties)
      .map((key) => `${key}="${this.properties[key]}"`)
      .join(" ");

    const gap = propertiesStr ? " " : "";

    return this.tagName
      ? `<${this.tagName}${gap}${propertiesStr}>${children}</${this.tagName}>`
      : children;
  }
}

export class TextNode {
  constructor(public nodeValue: string) {}
  renderToString() {
    return this.nodeValue;
  }
}

export type ServerNode = ElementNode | TextNode;

interface FiberDomServer extends Fiber {
  el?: ServerNode;
}

export const createOperator = (): Operator => {
  const createElement = (fiber: FiberDomServer) => {
    const { tag: type } = fiber;
    return isText(fiber)
      ? new TextNode(fiber.props.nodeValue + "")
      : new ElementNode(type as string);
  };

  const insertBefore = (
    containerFiber: FiberDomServer,
    insertElement: ServerNode,
    targetElement: ServerNode
  ) => {
    (containerFiber.el as ElementNode).insertBefore(
      insertElement,
      targetElement
    );
  };

  const firstChild = (fiber: FiberDomServer) =>
    (fiber.el as ElementNode).children[0] ?? null;

  const updateTextProperties = (fiber: FiberDomServer) => {
    (fiber.el as TextNode).nodeValue = fiber.props.nodeValue + "";
  };

  const updateElementProperties = (fiber: FiberDomServer) => {
    let { el, attrDiff } = fiber;

    for (const [key, newValue, oldValue] of attrDiff || []) {
      const newExist = !isNullish(newValue);
      const oldExist = !isNullish(oldValue);
      if (key === "ref") {
        oldExist && (oldValue.current = undefined);
        newExist && (newValue.current = el);
      } else if (isEvent(key)) {
        // nothing...
      } else {
        newExist
          ? ((el as ElementNode).properties[key] = newValue)
          : delete (el as ElementNode).properties[key];
      }
    }
  };

  return {
    nextElement() {},
    matchElement: () => false,
    remove() {},
    nextSibling() {},
    createElement,
    insertBefore,
    firstChild,
    updateTextProperties,
    updateElementProperties,
  };
};
