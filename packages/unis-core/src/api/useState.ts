import { use } from "./use";
import { reducerHOF } from "./useReducer";

export const stateHOF = <T extends any>(initial: T) => {
  return reducerHOF<T, T>((preState, action) => action, initial);
};

export function useState<T = undefined>(): [
  T | undefined,
  (value: T | undefined) => void
];
export function useState<T>(initial: T): [T, (value: T) => void];
export function useState<T>(initial?: T) {
  return use(stateHOF(initial), arguments[1]);
}
