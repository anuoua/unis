import { h, useProps, useLayoutEffect, useState, useMemo } from "@unis/core";
import { createBrowserHistory, BrowserHistory } from "history";
import { LocationContext, RouterContext } from "../context";

export interface BrowserRouterProps {
  children?: JSX.Element | JSX.Element[];
  history?: BrowserHistory;
  basename?: string;
}

export const BrowserRouter = (p: BrowserRouterProps) => {
  let { children, history, basename } = useProps(p);

  const historyInstance = history ?? createBrowserHistory();

  let [location, setLocation] = useState(historyInstance.location);

  const navigationContextValue = {
    basename: basename ?? "",
    history: historyInstance,
  };

  let locationContextValue = useMemo(
    () => ({ location }),
    () => [location]
  );

  useLayoutEffect(
    () => {
      const unlisten = historyInstance.listen(({ location }) => {
        setLocation(location);
      });
      return () => unlisten();
    },
    () => []
  );

  return () => (
    <RouterContext.Provider value={navigationContextValue}>
      <LocationContext.Provider value={locationContextValue}>
        {children}
      </LocationContext.Provider>
    </RouterContext.Provider>
  );
};
