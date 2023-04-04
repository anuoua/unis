import { useReducer } from "@unis/core";

export const uUpdate = () => {
  let [, dispatch] = useReducer((a) => a + 1, 0);

  const update = () => dispatch(undefined);

  return () => [update];
};
