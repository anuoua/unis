import { use } from "@unis/unis";
import { uHistory } from "./uHistory";

export const uLocation = () => {
  let { location } = use(uHistory());
  return () => location;
};
