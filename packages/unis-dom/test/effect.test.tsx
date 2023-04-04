/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { useEffect } from "@unis/core";
import { useState } from "@unis/core";
import { h } from "@unis/core";
import { render } from "../src";
import { sleep } from "./util";

let root: Element;

beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
});

afterEach(() => {
  root.innerHTML = "";
});

it("effect", async () => {
  const Bpp = () => {
    useEffect(
      () => {
        return () => {};
      },
      () => []
    );
    return () => "bpp";
  };

  const App = () => {
    let [visible, setVisible] = useState(true);

    useEffect(
      () => {
        setVisible(false);
      },
      () => []
    );

    return () => (visible ? <Bpp /> : null);
  };

  render(<App />, root);
  expect(root.innerHTML).toBe("bpp");
  await sleep(1);
  expect(root.innerHTML).toBe("");
});
