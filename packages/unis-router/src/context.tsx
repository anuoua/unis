import { createContext } from "@unis/unis";
import { BrowserHistory, Location } from "history";
import { MatchRoute } from "./types";

export interface RouteContextValue {
  route: MatchRoute;
  matches: MatchRoute[];
}

export const RouteContext = createContext<RouteContextValue>({
  route: undefined!,
  matches: [],
});

export interface RouterContextValue {
  history: BrowserHistory;
  basename: string;
}

export const RouterContext = createContext<RouterContextValue>(undefined!);

export interface LocationContextValue {
  location: Location;
}

export const LocationContext = createContext<LocationContextValue>(undefined!);
