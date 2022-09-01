import { h, use, useContext } from "@unis/unis";
import { RouteContext, RouterContext } from "../context";
import { Outlet } from "../components/Outlet";
import { RouteData } from "../types";
import { matchRoutes } from "../utils";

export const uRouter = (configFn: () => RouteData[]) => {
  let routerData = use(configFn);
  let { history, basename } = useContext(RouterContext);
  let { matches: parentRouteChain } = useContext(RouteContext);

  let location = use(() => history?.location!);

  let wrapedRouterData = use(() => [
    {
      path: basename,
      element: <Outlet />,
      children: routerData,
    } as RouteData,
  ]);

  let matches = use(() =>
    matchRoutes(location.pathname, wrapedRouterData, parentRouteChain)
  );
  console.log(wrapedRouterData, matches.at(0));

  return () => (
    <RouteContext.Provider
      value={{ route: matches.at(0), matches: matches.slice(1) }}
    >
      <Outlet />
    </RouteContext.Provider>
  );
};
