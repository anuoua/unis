import { h, use, useContext } from "@unis/unis";
import { RouteContext } from "../context";

export const Outlet = () => {
  let { matches, route } = useContext(RouteContext);

  let { element, ...rest } = use(() => route ?? {});

  return () =>
    route ? (
      <RouteContext.Provider
        value={{ route: matches.at(0) ?? rest, matches: matches.slice(1) }}
      >
        {element}
      </RouteContext.Provider>
    ) : null;
};
