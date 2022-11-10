import { cloneElement, FiberNode, use, useProps } from "@unis/unis";
import { uRouter } from "../hooks/uRouter";
import { Route } from "./Route";
import { RouteData } from "../types";

export type RoutesProps = Omit<RouteData, "children"> & {
  children?: JSX.Element | JSX.Element[];
};

export const Routes = (p: RoutesProps) => {
  let { children, path, element: incomeElement } = useProps(p);

  let realChildren = use(() => flatChildren(children));
  let routes = use(() => realChildren.map((node) => pick(node)));
  let element = use(
    uRouter(() => [
      {
        path,
        element: incomeElement,
        children: routes,
      } as RouteData,
    ])
  );

  function pick(node: FiberNode): RouteData {
    return {
      ...node.props,
      path: node.props.path,
      element: cloneElement(node.props.element),
      children: flatChildren(node.props.children).map(pick),
    };
  }

  function flatChildren(children: JSX.Element | JSX.Element[]) {
    return ([] as FiberNode[])
      .concat(children as FiberNode[])
      .filter((child) => child?.tag === Route);
  }

  return () => element;
};
