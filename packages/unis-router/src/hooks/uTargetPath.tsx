import { use, useContext } from "@unis/core";
import { RouteContext } from "../context";
import { resolvePath } from "../utils";

export interface Options {
  to?: string;
}

export const uTargetPath = (opts: () => Options) => {
  let { to } = use(opts);
  let { route } = useContext(RouteContext);

  let targetPath = use(() => resolvePath(route.pathname ?? "", to ?? ""));

  return () => targetPath;
};
