import { MatchRoute, RouteData } from "./types";

const SLASH = "/";
const DOT = ".";

const trimSlash = (str: string) => {
  const reg = new RegExp(`^[${SLASH}${DOT}]*`);
  const reg2 = new RegExp(`[${SLASH}${DOT}]*$`);
  return str.replace(reg, "").replace(reg2, "");
};

const split = (path: string) =>
  trimSlash(path) ? trimSlash(path).split(SLASH) : [];

const analysePath = (locationPathname: string, routePath: string) => {
  const locationChunks = split(locationPathname);
  const routeChunks = split(routePath);

  const params: Record<string, any> = {};

  for (let i = 0; i < routeChunks.length; i++) {
    const routeChunk = routeChunks[i];
    if (routeChunk.startsWith(":")) {
      params[routeChunk.slice(1)] = locationChunks[i];
    }
  }

  return {
    params,
    pathname:
      SLASH +
      (locationChunks
        .slice(
          0,
          routeChunks?.at(-1) === "*" ? undefined : routeChunks?.length ?? 0
        )
        .join(SLASH) ?? ""),
  };
};

const testPath = (
  locationPathname: string,
  routePath: string,
  final = false
) => {
  const locationChunks = split(locationPathname);
  const routeChunks = split(routePath);

  for (let i = 0; i < routeChunks.length; i++) {
    const routeChunk = routeChunks[i]!;
    const locationChunk = locationChunks[i];

    if (
      !locationChunk ||
      (!routeChunk.startsWith(":") &&
        routeChunk !== "*" &&
        routeChunk !== locationChunk)
    ) {
      return false;
    }
  }

  if (final && locationChunks.length > routeChunks.length) {
    return routeChunks.at(-1) === "*";
  }

  return true;
};

const getScore = (locationPathname: string, routeChain: RouteData[]) => {
  const routePath = resolveRoutesPath(routeChain);
  const locationChunks = split(locationPathname);
  const routeChunks = split(routePath);
  let score = 0;

  routeChunks.forEach((chunk, index) => {
    let base = 10 ^ ((locationChunks.length ?? 0) - index);
    if (chunk === "*") score += 1 * base;
    if (chunk.startsWith(":")) score += 2 * base;
    if (chunk === locationChunks[index]) score += 3 * base;
  });
  return score;
};

const resolveRoutesPath = (routes: RouteData[]) =>
  routes.reduce((pre, cur) => {
    const path = trimSlash(cur.path ?? "");
    return `${pre}${path ? SLASH + path : ""}`;
  }, "") || "/";

const isLocationEnd = (locationPathname: string, routePath: string) => {
  return split(locationPathname).length === split(routePath).length;
};

const matchRoute = (
  locationPathname: string,
  route: RouteData,
  parentRouteChain: RouteData[] = []
) => {
  const routeStack: RouteData[] = parentRouteChain;
  let matchedRouteChains: RouteData[][] = [];

  const walk = (route: RouteData) => {
    const routeChain = [...routeStack, route];
    const routePath = resolveRoutesPath(routeChain);
    const isEnd = (route.children?.length ?? 0) === 0;
    const result = testPath(locationPathname, routePath, isEnd);

    if (result) {
      if (isEnd) {
        matchedRouteChains.push(routeChain);
      } else {
        const preChainSize = matchedRouteChains.length;
        route.children?.forEach((childRoute) => {
          routeStack.push(route);
          walk(childRoute);
          routeStack.pop();
        });
        const afterChainSize = matchedRouteChains.length;
        if (
          afterChainSize === preChainSize &&
          isLocationEnd(locationPathname, routePath)
        ) {
          matchedRouteChains.push(routeChain);
        }
      }
    }
  };

  walk(route);

  return matchedRouteChains;
};

export const matchRoutes = (
  locationPathname: string,
  routes: RouteData[],
  parentRouteChain: RouteData[] = []
) => {
  const matchedRouteChains: RouteData[][] = [];
  routes.forEach((route) => {
    matchedRouteChains.push(
      ...matchRoute(locationPathname, route, parentRouteChain)
    );
  });
  matchedRouteChains.sort((a, b) => {
    const result =
      getScore(locationPathname, b) - getScore(locationPathname, a);
    if (result !== 0) return result;
    return b.length - a.length;
  });
  const finalChain = matchedRouteChains.at(0) ?? [];
  if (finalChain) {
    finalChain.forEach((route, index) => {
      const subChain = finalChain.slice(0, index + 1);
      const { params, pathname } = analysePath(
        locationPathname,
        resolveRoutesPath(subChain)
      );
      (route as MatchRoute).params = params;
      (route as MatchRoute).pathname = pathname;
    });
  }
  return finalChain;
};
