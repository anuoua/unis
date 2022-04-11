import { getWF, use, useProps } from "./api";
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
    let p = useProps(props, ($) => (p = $));
    // @ts-ignore
    let state = useContext(context, ($) => (state = $));
    return () => p.children(state);
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
    let contextItem: ContextItem | undefined;
    for (let i = dependencies.length - 1; i > 0; i--) {
      if (dependencies[i].context === context) {
        contextItem = dependencies[i];
        break;
      }
    }
    return contextItem ? contextItem.value : context.initial;
  };
  return () => readContext(getWF());
};

export function useContext(ctx: Context) {
  return use(contextHOF(ctx), arguments[1]);
}
