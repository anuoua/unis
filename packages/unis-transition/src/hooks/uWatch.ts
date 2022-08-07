import { use, useEffect, useLayoutEffect } from "@unis/unis";
import { uMounted } from "./uMounted";

export const uWatch = <T extends any>(
  handler: (currentValue: T, previousValue: T | undefined) => void,
  depsFn: () => [T],
  {
    immediately = false,
    layout = false,
  }: {
    immediately?: boolean;
    layout?: boolean;
  }
) => {
  let [mounted] = use(uMounted());
  let [value] = use(depsFn);

  let preValue = immediately ? undefined : value;

  const finalEffect = layout ? useLayoutEffect : useEffect;

  finalEffect(
    () => {
      if (!mounted && !immediately) return;
      handler(value, preValue);
      preValue = value;
    },
    () => [value]
  );
};
