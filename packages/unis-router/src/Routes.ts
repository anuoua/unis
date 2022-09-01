import { FiberNode, use, useProps } from "@unis/unis";
import { uRouter } from "./hooks/uRouter";
import { Route } from "./Route";
import { RouteData } from "./types";

export interface RoutesProps {
  children?: JSX.Element | JSX.Element[];
}

export const Routes = (p: RoutesProps) => {
  let { children } = useProps(p);

  let realChildren = use(() => flatChildren(children));
  let routes = use(() => realChildren.map((node) => pick(node)));
  let element = use(uRouter(() => routes));

  function pick(node: FiberNode): RouteData {
    return {
      ...node.props,
      children: flatChildren(node.props.children).map(pick),
    };
  }

  function flatChildren(children: JSX.Element | JSX.Element[]) {
    return ([] as FiberNode[])
      .concat(children as FiberNode[])
      .filter((child) => child?.tag === Route);
  }

  console.log("routes", routes, "matchRoutes", element);

  return () => element;
};
