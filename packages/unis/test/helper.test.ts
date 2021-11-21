import { $, extract, shallowReactive, ref, reactive } from "../src/unis";

describe("helper", () => {
  it("extract", () => {
    const result: any[] = [];
    const handle1 = () => {
      result.push("handle1");
    };
    const handle2 = () => {
      result.push("handle2");
    };
    const props = shallowReactive({
      name: "0",
      age: 0,
      onChange: handle1,
    });
    const ex1 = extract(props);
    ex1.onChange();
    expect(ex1).toMatchObject({
      name: { value: "0" },
      age: { value: 0 },
    });
    Object.assign(props, {
      name: "1",
      age: 1,
      onChange: handle2,
    });
    const ex2 = extract(props);
    expect(ex2).toMatchObject({
      name: { value: "1" },
      age: { value: 1 },
    });
    ex2.onChange();
    expect(result).toMatchObject(["handle1", "handle2"]);
  });

  it("$", () => {
    expect($("hello")).toBe("hello");
    expect($(reactive({ hello: "hello" }))).toMatchObject({ hello: "hello" });
    expect($(ref("hello"))).toBe("hello");
  });
});
