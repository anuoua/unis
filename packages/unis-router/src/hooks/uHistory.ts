import { useContext } from "@unis/unis";
import { RouterContext } from "../context";

export const uHistory = () => {
  let { history } = useContext(RouterContext);
  return () => history!;
};
