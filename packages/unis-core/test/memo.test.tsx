/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { useEffect, useState } from "../src/api";
import { h, h2, memo } from "../src/h";
import { render } from "../src/dom";
import { sleep } from "./util";

let root: Element;

beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
});

afterEach(() => {
  root.innerHTML = "";
});

it("memo", async () => {
  const Bpp = memo(() => {
    let renderCount = 0;

    return () => {
      return <div>{renderCount++}</div>;
    };
  });
  const App = () => {
    let [msg, setMsg] = useState("hello");

    useEffect(
      () => {
        setMsg("hello world");
      },
      () => []
    );

    return () => (
      <div>
        {msg}
        {h2(Bpp, {}, "key")}
      </div>
    );
  };

  render(<App />, root);
  expect(root.innerHTML).toBe("<div>hello<div>0</div></div>");
  await sleep(1);
  expect(root.innerHTML).toBe("<div>hello world<div>0</div></div>");
});
