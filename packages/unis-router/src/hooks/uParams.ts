import { useContext } from "@unis/core";
import { RouteContext } from "../context";

export const uParams = <T = Record<string, any>>() => {
  let { route } = useContext(RouteContext);
  return () => route?.params as unknown as T;
};
