import { ComponentVode, findParent, getCurrentVode } from "./vode";

const contextMap = new WeakMap();

export function createContext<T extends any>(initial: T) {
  const Provider = (props: { children: JSX.Element; value?: T }) => {
    const vode = getCurrentVode()!;
    contextMap.set(vode, props.value ?? initial);
    return () => props.children;
  };

  const Consumer = (props: { children: (value: T) => JSX.Element }) => {
    const ctxValue = getValue();
    return () => props.children(ctxValue as T);
  };

  const getValue = () => {
    const vode = getCurrentVode()!;
    const targetVode = findParent(vode, (vode) => vode.type === Provider) as
      | ComponentVode
      | undefined;
    if (!targetVode) throw new Error("No context provider found");
    return contextMap.get(targetVode) as T;
  };

  return {
    Provider,
    Consumer,
    getValue,
  };
}
