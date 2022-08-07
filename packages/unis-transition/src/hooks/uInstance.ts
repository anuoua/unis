import { Fiber, use } from "@unis/unis";

export const uInstance = () => {
  let instance = use((WF: Fiber) => WF);
  return () => [instance];
};
