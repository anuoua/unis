import {
  AnchorHTMLAttributes,
  ElementAttrs,
  h,
  use,
  useContext,
  useProps,
} from "@unis/unis";
import { RouteContext, RouterContext } from "../context";
import { resolvePath } from "../utils";

export type LinkProps = Partial<
  Omit<ElementAttrs<AnchorHTMLAttributes>, "href"> & {
    to: string;
  }
>;

export const Link = (p: LinkProps) => {
  let { to, children, ...rest } = useProps(p);

  let { history } = useContext(RouterContext);
  let { route } = useContext(RouteContext);

  let targetPath = use(() => resolvePath(route.pathname ?? "", to ?? ""));

  const handleJump = (e: MouseEvent) => {
    history.location.pathname !== targetPath && history.push(targetPath);
    e.preventDefault();
  };

  return () => (
    <a {...rest} href={targetPath} onClick={handleJump}>
      {children}
    </a>
  );
};
