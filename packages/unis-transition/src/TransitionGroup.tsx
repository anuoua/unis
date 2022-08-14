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
      const existingNode = transitionMap[child.props.key];
      if (existingNode) return existingNode;
      const newChild = { ...child };
      const originProps = newChild.props;
      const onExited = newChild.props.onExited;
      newChild.props = {
        ...originProps,
        in: true,
        onExited: (...args: unknown[]) => {
          onExited?.(...args);
          remove(originProps.key);
        },
      };
      return newChild;
    });

    transitionChildren.forEach((child, index) => {
      const newChild = { ...child };
      if (!flatMap[newChild.props.key]) {
        newChild.props = {
          ...newChild.props,
          in: false,
        };
        newFlatChildren.splice(index, 0, newChild);
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
