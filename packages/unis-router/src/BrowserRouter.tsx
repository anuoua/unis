import { h, useProps, useLayoutEffect, useState } from "@unis/unis";
import { createBrowserHistory, BrowserHistory } from "history";
import { RouterContext } from "./context";

export interface BrowserRouterProps {
  children?: JSX.Element | JSX.Element[];
  history?: BrowserHistory;
  basename?: string;
}

export const BrowserRouter = (p: BrowserRouterProps) => {
  let { children, history, basename } = useProps(p);

  const historyInstance = history ?? createBrowserHistory();

  let [providerValue, setProviderValue] = useState({
    history: historyInstance,
    basename,
  });

  useLayoutEffect(
    () => {
      const unlisten = historyInstance.listen(({ action, location }) => {
        console.log(action, location);
        setProviderValue({ ...providerValue });
      });
      return () => unlisten();
    },
    () => []
  );

  return () => (
    <RouterContext.Provider value={providerValue}>
      {children}
    </RouterContext.Provider>
  );
};
