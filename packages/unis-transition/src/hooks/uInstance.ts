import { Fiber, use } from "@unis/core";

export const uInstance = () => {
  let instance = use((WF: Fiber) => WF);
  return () => [instance];
};
