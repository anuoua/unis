import { use, useLayoutEffect } from "@unis/unis";

export const uWatch = <T extends any>(
  handler: (currentValue: T, previousValue: T | undefined) => void,
  depsFn: () => [T]
) => {
  let [value] = use(depsFn);

  let preValue: T | undefined = undefined;

  useLayoutEffect(
    () => {
      handler(value, preValue);
      preValue = value;
    },
    () => [value]
  );
};
