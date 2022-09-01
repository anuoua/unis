import { createContext } from "@unis/unis";
import { BrowserHistory } from "history";
import { MatchRoute } from "./types";

export interface RouteContextValue {
  route?: MatchRoute;
  matches: MatchRoute[];
}

export const RouteContext = createContext<RouteContextValue>({
  route: undefined,
  matches: [],
});

export interface RouterContextValue {
  history?: BrowserHistory;
  basename?: string;
}

export const RouterContext = createContext<RouterContextValue>({
  history: undefined,
  basename: undefined,
});
