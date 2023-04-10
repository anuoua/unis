import { it, expect } from "vitest";
import { transform } from "@babel/core";
import unisPreset from "../src/index";

const code = `
import { useState } from "@unis/core";
let [a, seta] = useState(1);
`;

const transformed = `import { useState } from "@unis/core";
let [a, seta] = useState(1, ([$0, $1]) => {
  a = $0;
  seta = $1;
});`;

it("transform", () => {
  const result = transform(code, {
    presets: [unisPreset],
  });
  expect(result?.code).toBe(transformed);
});
