/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { useEffect } from "@unis/core";
import { useState } from "@unis/core";
import { rendered, testRender } from "./util";

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

  testRender(<App />, root);
  expect(root.innerHTML).toBe("bpp");
  await rendered();
  expect(root.innerHTML).toBe("");
});
