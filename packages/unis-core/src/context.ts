import { use, useProps } from "./api";
import { CONTEXT, Fiber } from "./fiber";

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
    context: providerContextMap.get(fiber.type as Function)!,
    value: fiber.props.value,
  };
};

export const findDependency = (fiber: Fiber, contextFiber: Fiber) =>
  fiber.dependencies?.find(
    (dependency) =>
      dependency.context ===
      providerContextMap.get(contextFiber.parent?.type as Function)
  );

export function createContext<T>(initial: T): Context<T>;
export function createContext<T>(initial: T) {
  const Provider = (props: { value: T | undefined; children: any }) =>
    ({
      type: CONTEXT,
      props,
    } as Fiber);

  const Consumer = (props: { children: (value: T) => JSX.Element }) => {
    // @ts-ignore
    let p = useProps(props, ($) => (p = $));
    // @ts-ignore
    let state = useContext(context, ($) => (state = $));
    return () => p.children(state);
  };

  const context: Context<T | undefined> = {
    Provider,
    Consumer,
    initial,
  };

  providerContextMap.set(Provider, context);

  return context;
}

const contextHOF = (context: Context) => {
  const readContext = (fiber: Fiber) => {
    const result = (fiber?.reconcileState?.dependencyList ?? [])
      .filter((dependency) => dependency.context === context)
      .pop();

    if (result) {
      if (fiber.dependencies) {
        fiber.dependencies.push(result);
      } else {
        fiber.dependencies = [result];
      }
      return result.value;
    } else {
      return context.initial;
    }
  };
  return (WF: Fiber) => readContext(WF);
};

export function useContext(ctx: Context) {
  return use(contextHOF(ctx), arguments[1]);
}
