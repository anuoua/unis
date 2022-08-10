import { FiberNode, use, useEffect, useProps, useState } from "@unis/unis";
import { CSSTransition } from "./CSSTransition";

export interface TransitionGroupProps {
  children: JSX.Element | JSX.Element[];
}

export const TransitionGroup = (p: TransitionGroupProps) => {
  let { children } = useProps(p);

  let [transitionChildren, setTransitionChildren] = useState<FiberNode[]>([]);

  let flatChildren = use(() =>
    ([] as FiberNode[])
      .concat(children as unknown as FiberNode)
      .filter((child) => child.tag === CSSTransition)
  );

  let childrenKeys = use(() =>
    flatChildren.map((child) => child.props.key).join(",")
  );

  const remove = (key: string) => {
    setTransitionChildren(
      transitionChildren.filter((child) => child.props.key !== key)
    );
  };

  const handleChildren = () => {
    const flatMap: Record<string, FiberNode> = {};
    flatChildren.forEach((child) => {
      flatMap[child.props.key] = child;
    });

    const transitionMap: Record<string, FiberNode> = {};
    transitionChildren.forEach((child) => {
      transitionMap[child.props.key] = child;
    });

    const newFlatChildren = flatChildren.map((child) => {
      if (!transitionMap[child.props.key]) {
        child.props = {
          ...child.props,
          in: true,
        };
      }
      const onExited = child.props.onExited;
      child.props.onExited = (...args: unknown[]) => {
        onExited?.(...args);
        remove(child.props.key);
      };
      return child;
    });

    transitionChildren.forEach((child, index) => {
      if (!flatMap[child.props.key]) {
        child.props = {
          ...child.props,
          in: false,
        };
        newFlatChildren.splice(index, 0, child);
      }
    });

    setTransitionChildren(newFlatChildren);
  };

  useEffect(
    () => {
      handleChildren();
    },
    () => [childrenKeys]
  );

  return () => transitionChildren;
};
