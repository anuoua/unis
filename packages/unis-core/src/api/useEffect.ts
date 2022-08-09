import { Effect, getWF } from ".";

export const useEffect = (cb: Effect, depsFn?: () => any[]) => {
  const workingFiber = getWF();
  cb.depsFn = depsFn;
  workingFiber.effects?.push(cb) ?? (workingFiber.effects = [cb]);
};
