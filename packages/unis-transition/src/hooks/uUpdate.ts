import { useReducer } from "@unis/unis";

export const uUpdate = () => {
  let [, dispatch] = useReducer((a) => a + 1, 0);

  const update = () => dispatch(undefined);

  return () => [update];
};
