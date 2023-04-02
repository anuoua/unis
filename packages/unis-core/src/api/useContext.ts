import { Context } from "../context";
import { Fiber } from "../fiber";
import { use } from "./use";

export function useContext<T extends Context>(ctx: T) {
  return use(contextHof(ctx), arguments[1]);
}

const contextHof = <T extends Context>(context: T) => {
  const readContext = (fiber: Fiber): T["initial"] => {
    const { dependencyList = [] } = fiber.reconcileState!;
    const result = [...dependencyList]
      .reverse()
      .find((d) => d.context === context);

    if (result) {
      if (fiber.dependencies) {
        !fiber.dependencies.includes(result) && fiber.dependencies.push(result);
      } else {
        fiber.dependencies = [result];
      }
      return result.value;
    } else {
      return context.initial;
    }
  };
  return (WF: Fiber) => readContext(WF);
};
