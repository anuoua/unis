import { useContext, useEffect, useProps } from "@unis/unis";
import { RouteContext, RouterContext } from "../context";
import { resolvePath } from "../utils";

export interface RedirectProps {
  to?: string;
  replace?: boolean;
}

export const Redirect = (p: RedirectProps) => {
  let { to, replace = true } = useProps(p);
  let { history } = useContext(RouterContext);
  let { route } = useContext(RouteContext);
  useEffect(
    () => {
      if (route) {
        const pathname = resolvePath(route.pathname!, to ?? "");
        replace ? history.replace(pathname) : history.push(pathname);
      }
    },
    () => []
  );
  return () => null;
};
