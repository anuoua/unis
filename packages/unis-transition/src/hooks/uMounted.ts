import { use, useEffect } from "@unis/unis";
import { uUpdate } from "./uUpdate";

export const uMounted = (needUpdate = true) => {
  let [update] = use(uUpdate());
  let mounted = false;

  useEffect(
    () => {
      mounted = true;
      needUpdate && update();
    },
    () => []
  );

  return () => [mounted];
};
