/**
 * @vitest-environment jsdom
 */
import { expect, it } from "vitest";
import { classes, svgKey, styleStr } from "@unis/core";

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
