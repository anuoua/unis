import { Effect, getWF } from ".";

export const useLayoutEffect = (cb: Effect, depsFn?: () => any[]) => {
  const workingFiber = getWF();
  cb.depsFn = depsFn;
  workingFiber.layoutEffects?.push(cb) ?? (workingFiber.layoutEffects = [cb]);
};
