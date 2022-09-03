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
  let { to, children, onClick, ...rest } = useProps(p);

  let { history } = useContext(RouterContext);
  let { route } = useContext(RouteContext);

  let targetPath = use(() => resolvePath(route.pathname ?? "", to ?? ""));

  const handleJump = (e: MouseEvent) => {
    const target = (e.target as HTMLAnchorElement).target;
    if (
      e.button === 0 &&
      (!target || target === "_self") &&
      !(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
    ) {
      if (history.location.pathname !== targetPath) {
        history.replace(targetPath);
      } else {
        history.push(targetPath);
      }
      e.preventDefault();
    }
    onClick?.(e);
  };

  return () => (
    <a {...rest} href={targetPath} onClick={handleJump}>
      {children}
    </a>
  );
};
