import { getWF, use, useProps } from "./api";
import { CONTEXT, Fiber } from "./fiber";
import { getDependency } from "./reconcile";

export interface Context<T = any> {
  Provider: (props: { value: T; children: any }) => JSX.Element;
  Consumer: (props: { children: (value: T) => JSX.Element }) => JSX.Element;
  initial: T;
}

export interface Dependency<T = any> {
  context: Context<T>;
  value: T;
}

export const contextMap = new WeakMap<Function, Context>();

export const createDependency = (fiber: Fiber) => {
  return {
    context: contextMap.get(fiber.type as Function)!,
    value: fiber.props.value,
  };
};

export const findDependency = (fiber: Fiber, contextFiber: Fiber) =>
  fiber.dependencies?.find(
    (dependency) =>
      dependency.context ===
      contextMap.get(contextFiber.parent?.type as Function)
  );

export function createContext<T = undefined>(): Context<T | undefined>;
export function createContext<T>(initial: T): Context<T>;
export function createContext<T>(initial?: T) {
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

  contextMap.set(Provider, context);

  return context;
}

const contextHOF = (context: Context) => {
  const readContext = (fiber: Fiber) => {
    const dependencies = getDependency();
    fiber.dependencies = [...dependencies];
    let dependency: Dependency | undefined;
    for (let i = dependencies.length - 1; i >= 0; i--) {
      if (dependencies[i].context === context) {
        dependency = dependencies[i];
        break;
      }
    }
    return dependency ? dependency.value : context.initial;
  };
  return () => readContext(getWF());
};

export function useContext(ctx: Context) {
  return use(contextHOF(ctx), arguments[1]);
}
