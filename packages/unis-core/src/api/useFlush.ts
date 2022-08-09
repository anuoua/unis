import { use } from "./use";

export const useFlush = (cb: () => void) => use(cb, () => {});
