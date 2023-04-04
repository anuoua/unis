/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
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

it("hydrate", async () => {
  root.innerHTML = "<div>App<span>hello</span></div>";

  const App = () => {
    return () => (
      <div>
        App<span>hello</span>
      </div>
    );
  };

  render(<App />, root, true);

  await sleep(1);

  expect(root.innerHTML).toBe("<div>App<span>hello</span></div>");
});
