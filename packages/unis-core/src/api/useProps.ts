import { Fiber } from "../fiber";
import { use } from "./use";

export function useProps<T>(p: T) {
  return use(propsHOF(p), arguments[1]);
}

export const propsHOF = <T>(props: T) => {
  return (WF: Fiber) => WF.props as T;
};
