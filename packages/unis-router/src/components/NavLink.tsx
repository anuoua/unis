import { h, HTMLAttributes, use, useContext, useProps } from "@unis/unis";
import { RouteContext } from "../context";
import { Link, LinkProps } from "./Link";

export type LinkStyle = (isActive: boolean) => HTMLAttributes["style"];
export type LinkClassName = (isActive: boolean) => HTMLAttributes["className"];

export type NavLinkProps = Omit<LinkProps, "style" | "className"> & {
  style?: LinkStyle;
  className?: LinkClassName;
};

export const NavLink = (p: NavLinkProps) => {
  let { style, className, ...rest } = useProps(p);

  let { matches } = useContext(RouteContext);

  let isActive = use(
    () => !!matches.find((i) => i.pathname === location.pathname)
  );

  return () => (
    <Link
      {...rest}
      style={style?.(isActive)}
      className={className?.(isActive)}
    />
  );
};
