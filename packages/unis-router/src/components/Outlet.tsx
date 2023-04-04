import { h, use, useContext } from "@unis/core";
import { RouteContext } from "../context";

export const Outlet = () => {
  let { matches, route } = useContext(RouteContext);

  let nextRoute = use(() => matches[matches.findIndex((i) => i === route) + 1]);

  let { element, ...rest } = use(() => route ?? {});

  return () =>
    route ? (
      <RouteContext.Provider value={{ route: nextRoute ?? rest, matches }}>
        {element}
      </RouteContext.Provider>
    ) : null;
};
