import { Fiber } from "../fiber";
import { getWF } from "./utils";
import { use } from "./use";
import { generateId } from "../utils";

export const idHof = () => {
  let workingFiber = getWF();
  if (!workingFiber.id) {
    workingFiber.id = generateId();
  }
  return (WF: Fiber) => WF.id;
};

export function useId() {
  return use(idHof());
}
