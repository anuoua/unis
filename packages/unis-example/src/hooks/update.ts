import { useState } from "@unis/core";

export const Update = () => {
  let [count, setCount] = useState(1);
  const update = () => setCount(++count);
  return () => [update];
};
