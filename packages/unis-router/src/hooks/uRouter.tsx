import { h, use, useContext } from "@unis/core";
import { RouteContext, RouterContext } from "../context";
import { Outlet } from "../components/Outlet";
import { RouteData } from "../types";
import { matchRoutes } from "../utils";

export const uRouter = (configFn: () => RouteData[]) => {
  let routerData = use(configFn);
  let { history, basename } = useContext(RouterContext);

  let location = use(() => history?.location!);

  let wrapedRouterData = use(() => [
    {
      path: basename,
      element: <Outlet />,
      children: routerData,
    } as RouteData,
  ]);

  let matches = use(() => matchRoutes(location.pathname, wrapedRouterData));

  return () => (
    <RouteContext.Provider value={{ route: matches.at(0)!, matches }}>
      <Outlet />
    </RouteContext.Provider>
  );
};
