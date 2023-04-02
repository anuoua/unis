import { use } from "./use";
import { reducerHof } from "./useReducer";

export const stateHof = <T extends any>(initial: T) => {
  return reducerHof<T, T>((preState, action) => action, initial);
};

export function useState<T = undefined>(): [
  T | undefined,
  (value: T | undefined) => void
];
export function useState<T>(initial: T): [T, (value: T) => void];
export function useState<T>(initial?: T) {
  return use(stateHof(initial), arguments[1]);
}
