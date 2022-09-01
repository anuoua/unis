import { createContext } from "@unis/unis";
import { BrowserHistory } from "history";
import { MatchRoute } from "./types";

export interface RouteContextValue {
  outlet?: JSX.Element;
  matches: MatchRoute[];
}

export const RouteContext = createContext<RouteContextValue>({
  outlet: undefined,
  matches: [],
});

export interface RouterContextValue {
  history?: BrowserHistory;
}

export const RouterContext = createContext<RouterContextValue>({
  history: undefined,
});
