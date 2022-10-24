import { markFiber, use, useProps } from "./api";
import { PROVIDER, createNext, Fiber, WalkHook, isProvider } from "./fiber";

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
    // @ts-ignore
    let p = useProps(props, ($) => (p = $));
    // @ts-ignore
    let state = useContext(context, ($) => (state = $));
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

const contextHOF = <T extends Context>(context: T) => {
  const readContext = (fiber: Fiber): T["initial"] => {
    const { dependencyList = [] } = fiber.reconcileState!;
    const result = [...dependencyList]
      .reverse()
      .find((d) => d.context === context);

    if (result) {
      if (fiber.dependencies) {
        !fiber.dependencies.includes(result) && fiber.dependencies.push(result);
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

export function useContext<T extends Context>(ctx: T) {
  return use(contextHOF(ctx), arguments[1]);
}

export const contextWalkHook: WalkHook = {
  down: (from: Fiber, to?: Fiber) => {
    isProvider(from) &&
      from.reconcileState!.dependencyList.push(createDependency(from));
  },

  up: (from: Fiber, to?: Fiber) => {
    to && isProvider(to) && from.reconcileState!.dependencyList.pop();
  },

  enter: (enter: Fiber, skipChild: boolean) => {
    if (
      enter.alternate &&
      isProvider(enter.alternate) &&
      !Object.is(enter.alternate.props.value, enter.props.value)
    ) {
      let alternate = enter.alternate;
      let indexFiber: Fiber | undefined = alternate;

      const [next, addHook] = createNext();

      addHook({ up: (from, to) => to !== alternate });

      do {
        findDependency(indexFiber, enter) && markFiber(indexFiber);
        indexFiber = next(
          indexFiber,
          indexFiber !== alternate &&
            isProvider(indexFiber) &&
            indexFiber.tag === enter.tag
        );
      } while (indexFiber);
    }
  },
};
