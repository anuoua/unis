import { ref } from "@vue/reactivity";
import { ComponentVode, findParent, getCurrentComponentVode } from "./vode";

const contextMap = new WeakMap();

export function createContext<T extends object>(initial: T) {
  let data = ref(initial);

  const Provider = (props: { children: JSX.Element; value?: T }) => {
    props.value && (data.value = props.value);
    return () => props.children;
  };

  const Consumer = (props: { children: (value: T) => JSX.Element }) => {
    const ctxValue = getValue();
    return () => props.children(ctxValue as T);
  };

  const getValue = () => {
    const vode = getCurrentComponentVode()!;
    const targetVode = findParent(vode, (vode) => vode.type === Provider) as
      | ComponentVode
      | undefined;
    if (!targetVode) throw new Error("No context provider found");
    return contextMap.get(targetVode.type).value as T;
  };

  contextMap.set(Provider, data);

  return {
    Provider,
    Consumer,
    getValue,
  };
}
