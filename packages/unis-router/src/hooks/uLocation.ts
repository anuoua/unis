import { use } from "@unis/core";
import { uHistory } from "./uHistory";

export const uLocation = () => {
  let { location } = use(uHistory());
  return () => location;
};
