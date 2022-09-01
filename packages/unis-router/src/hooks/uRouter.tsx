import { h, use, useContext } from "@unis/unis";
import { RouteContext, RouterContext } from "../context";
import { Outlet } from "../Outlet";
import { RouteData } from "../types";
import { matchRoutes } from "../utils";

export const uRouter = (configFn: () => RouteData[]) => {
  let routerData = use(configFn);
  let { matches: parentRouteChain, outlet } = useContext(RouteContext);
  let { history } = useContext(RouterContext);

  let location = use(() => history?.location!);

  let matches = use(() =>
    matchRoutes(location.pathname, routerData, parentRouteChain)
  );

  console.log("matches", [...matches]);

  return () => (
    <RouteContext.Provider
      value={{ outlet: matches.shift()?.element, matches: [...matches] }}
    >
      {outlet ?? <Outlet />}
    </RouteContext.Provider>
  );
};
