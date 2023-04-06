import {
  AnchorHTMLAttributes,
  ElementAttrs,
  use,
  useContext,
  useProps,
} from "@unis/core";
import { RouterContext } from "../context";
import { uTargetPath } from "../hooks/uTargetPath";

export type LinkProps = Partial<
  Omit<ElementAttrs<AnchorHTMLAttributes>, "href"> & {
    to: string;
  }
>;

export const Link = (p: LinkProps) => {
  let { to, children, onClick, ...rest } = useProps(p);

  let { history } = useContext(RouterContext);

  let targetPath = use(uTargetPath(() => ({ to })));

  const handleJump = (e: MouseEvent) => {
    const target = (e.target as HTMLAnchorElement).target;
    if (
      e.button === 0 &&
      (!target || target === "_self") &&
      !(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
    ) {
      if (history.location.pathname !== targetPath) {
        history.push(targetPath);
      } else {
        history.replace(targetPath);
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
