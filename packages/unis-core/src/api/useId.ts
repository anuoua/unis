import { getWF } from "./utils";
import { Fiber } from "../fiber";
import { use } from "./use";

let id = 0;
let preId = "";

export const idHof = () => {
  let workingFiber = getWF();
  if (!workingFiber.id) {
    if (id === Number.MAX_SAFE_INTEGER) {
      preId += id.toString(32);
      id = 0;
    }
    workingFiber.id = `u:${preId}${(id++).toString(32)}`;
  }
  return (WF: Fiber) => WF.id;
};

export function useId() {
  return use(idHof());
}
