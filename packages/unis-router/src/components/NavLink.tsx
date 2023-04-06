import { HTMLAttributes, use, useContext, useProps } from "@unis/core";
import { RouteContext } from "../context";
import { uTargetPath } from "../hooks/uTargetPath";
import { Link, LinkProps } from "./Link";

export type LinkStyle = (isActive: boolean) => HTMLAttributes["style"];
export type LinkClassName = (isActive: boolean) => HTMLAttributes["className"];

export type NavLinkProps = Omit<LinkProps, "style" | "className"> & {
  style?: LinkStyle;
  className?: LinkClassName;
};

export const NavLink = (p: NavLinkProps) => {
  let { style, className, to, ...rest } = useProps(p);
  let { matches } = useContext(RouteContext);
  let targetPath = use(uTargetPath(() => ({ to })));

  let isActive = use(() => !!matches.find((i) => i.pathname === targetPath));

  return () => (
    <Link
      {...rest}
      to={to}
      style={style?.(isActive)}
      className={className?.(isActive)}
    />
  );
};
