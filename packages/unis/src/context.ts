import { getWF, use } from "./api";
import { CONTEXT, Fiber } from "./fiber";
import { getContextList } from "./reconcile";

export interface Context {
  Provider: Function;
  Consumer: Function;
  initial: any;
}

export interface ContextItem {
  context: Context;
  value: any;
}

export const contextMap = new WeakMap<Function, Context>();

export const createContextItem = (fiber: Fiber) => {
  return {
    context: contextMap.get(fiber.type as Function)!,
    value: fiber.props.value,
  };
};

export const createContext = <T extends any>(initial: T) => {
  const Provider = (props: { value: T; children: any }) =>
    ({
      type: CONTEXT,
      props,
    } as Fiber);

  const Consumer = (props: { children: any }) => {
    // @ts-ignore
    let state = useContext(context, ($) => (state = $));
    return () => props.children(state);
  };

  const context = {
    Provider,
    Consumer,
    initial,
  };

  contextMap.set(Provider, context);

  return context;
};

export const contextHOF = (context: Context) => {
  const readContext = (fiber: Fiber) => {
    const dependencies = getContextList();
    fiber.dependencies = [...dependencies];
    const provider = dependencies.find((i) => i.context === context);
    return provider ? provider.value : context.initial;
  };
  return () => readContext(getWF());
};

export function useContext(ctx: Context) {
  return use(contextHOF(ctx), arguments[1]);
}
