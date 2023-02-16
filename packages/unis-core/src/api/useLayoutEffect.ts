import { Effect, EFFECT_TYPE, useEffect } from ".";

export const useLayoutEffect = (cb: Effect, depsFn?: () => any[]) => {
  cb.type = EFFECT_TYPE.LAYOUT;
  return useEffect(cb, depsFn);
};
