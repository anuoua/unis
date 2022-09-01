import { h, useContext } from "@unis/unis";
import { RouteContext } from "./context";

export const Outlet = () => {
  let { matches, outlet } = useContext(RouteContext);

  return () => (
    <RouteContext.Provider
      value={{ outlet: matches.pop()?.element, matches: [...matches] }}
    >
      {outlet}
    </RouteContext.Provider>
  );
};
