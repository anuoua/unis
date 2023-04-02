import { useProps } from "./api/useProps";
import { useContext } from "./api/useContext";
import { PROVIDER, Fiber } from "./fiber";

export interface Context<T = any> {
  Provider: (props: { value: T; children: any }) => JSX.Element;
  Consumer: (props: { children: (value: T) => JSX.Element }) => JSX.Element;
  initial: T;
}

export interface Dependency<T = any> {
  context: Context<T>;
  value: T;
}

const providerContextMap = new WeakMap<Function, Context>();

export const createDependency = (fiber: Fiber) => {
  return {
    context: providerContextMap.get(fiber.tag as Function)!,
    value: fiber.props.value,
  };
};

export const findDependency = (fiber: Fiber, contextFiber: Fiber) =>
  fiber.dependencies?.find(
    (dependency) =>
      dependency.context ===
      providerContextMap.get(contextFiber.tag as Function)
  );

export function createContext<T>(initial: T): Context<T>;
export function createContext<T>(initial: T) {
  const Provider = (props: { value: T; children: any }) => props.children;

  Provider.take = {
    type: PROVIDER,
  };

  const Consumer = (props: { children: (value: T) => JSX.Element }) => {
    let p = useProps(
      props,
      // @ts-ignore
      ($) => (p = $)
    );
    let state = useContext(
      context,
      // @ts-ignore
      ($) => (state = $)
    );
    return () => p.children(state);
  };

  const context: Context<T> = {
    Provider,
    Consumer,
    initial,
  };

  providerContextMap.set(Provider, context);

  return context;
}
