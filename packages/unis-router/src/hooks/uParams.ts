import { useContext } from "@unis/unis";
import { RouteContext } from "../context";

export const uParams = () => {
  let { route } = useContext(RouteContext);
  return () => route!.params;
};
