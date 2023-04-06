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

it("diff with key", async () => {
  const App = () => {
    let [toggle, setToggle] = useState(false);

    useEffect(
      () => {
        setToggle(true);
      },
      () => []
    );

    return () =>
      !toggle ? (
        <div>
          <span>1</span>
          <span key="2">2</span>
          <span key="3">3</span>
          <div>del</div>
          <span key="4">4</span>
          <div key="5">5</div>
          <div>6</div>
        </div>
      ) : (
        <div>
          <span>1</span>
          <div key="5">5</div>
          <span key="4">4</span>
          <span key="2">2</span>
          <span key="3">3</span>
          <div>6</div>
        </div>
      );
  };

  testRender(<App />, root);
  expect(root.innerHTML).toBe(
    '<div><span>1</span><span key="2">2</span><span key="3">3</span><div>del</div><span key="4">4</span><div key="5">5</div><div>6</div></div>'
  );
  await rendered();
  expect(root.innerHTML).toBe(
    '<div><span>1</span><div key="5">5</div><span key="4">4</span><span key="2">2</span><span key="3">3</span><div>6</div></div>'
  );
});
