import { Effect, EFFECT_TYPE, getWF } from "./utils";

export const useEffect = (cb: Effect, depsFn?: () => any[]) => {
  const workingFiber = getWF();
  cb.depsFn = depsFn;
  if (!cb.type) cb.type = EFFECT_TYPE.TICK;
  workingFiber.effects?.push(cb) ?? (workingFiber.effects = [cb]);
};
