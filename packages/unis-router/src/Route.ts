import { RouteData } from "./types";

export type RouteProps = Omit<RouteData, "children"> & {
  children?: JSX.Element | JSX.Element[];
};

export const Route = (p: RouteProps) => null;
