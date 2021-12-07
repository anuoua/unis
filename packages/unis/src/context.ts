import { ref } from "@vue/reactivity";
import { getCurrentComponentVode } from "./life";
import { ComponentVode, Vode } from "./vode";

const contextMap = new WeakMap();

function parentToTop(vode: Vode, cb: (vode: Vode) => boolean) {
  while ((vode = vode?.parentVode)) {
    if (cb(vode)) return vode;
  }
}

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
    const vode = getCurrentComponentVode();
    const targetVode = parentToTop(
      vode!,
      (v) => v.type === Provider
    ) as ComponentVode;
    if (!targetVode) throw new Error("no provider");
    return contextMap.get(targetVode.type).value as T;
  };

  contextMap.set(Provider, data);

  return {
    Provider,
    Consumer,
    getValue,
  };
}
