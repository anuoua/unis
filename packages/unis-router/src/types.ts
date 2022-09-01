export interface RouteData {
  path?: string;
  element?: JSX.Element;
  children?: RouteData[];
}

export interface MatchRoute extends RouteData {
  pathname?: string;
  params?: Record<string, string>;
}
