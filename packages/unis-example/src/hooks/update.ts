import { useState } from "@unis/unis";

export const update = () => {
  let [count, setCount] = useState(1);
  const update = () => setCount(++count);
  return () => [update];
};
