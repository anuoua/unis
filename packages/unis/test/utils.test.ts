import { classes } from "../src/utils";

describe("utils", () => {
  it("classes", () => {
    expect(
      classes([
        "a",
        "b",
        null,
        undefined,
        true,
        false,
        {
          c: true,
          d: "true",
          e: false,
        },
      ])
    ).toBe("a b c d");

    expect(classes("a b")).toBe("a b");
    expect(classes({ a: true, b: false, c: true })).toBe("a c");
  });
});
