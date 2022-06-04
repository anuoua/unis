/**
 * @vitest-environment jsdom
 */
import { expect, it } from "vitest";
import { classes, svgKey, styleStr, picks } from "../src/utils";

it("classes", () => {
  expect(classes(["a", "b", 1, ["c", { d: true }]])).toBe("a b 1 c d");
  expect(classes({ a: true, b: undefined, c: null })).toBe("a");
  expect(classes({ a: false, b: true, c: null })).toBe("b");
});

it("realSVGAttr", () => {
  expect(svgKey("glyphOrientationVertical")).toBe("glyph-orientation-vertical");
});

it("style2String", () => {
  expect(styleStr({ background: "yellow", fontSize: "14px" })).toBe(
    "background: yellow; font-size: 14px;"
  );
});

it("picks", () => {
  expect(picks({ hello: "a", world: "b" }, ["hello"])).toMatchObject({
    hello: "a",
  });
});
