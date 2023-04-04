import { useContext } from "@unis/core";
import { RouterContext } from "../context";

export const uHistory = () => {
  let { history } = useContext(RouterContext);
  return () => history!;
};
