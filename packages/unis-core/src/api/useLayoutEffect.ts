import { useEffect } from "./useEffect";
import { Effect, EFFECT_TYPE } from "./utils";

export const useLayoutEffect = (cb: Effect, depsFn?: () => any[]) => {
  cb.type = EFFECT_TYPE.LAYOUT;
  return useEffect(cb, depsFn);
};
