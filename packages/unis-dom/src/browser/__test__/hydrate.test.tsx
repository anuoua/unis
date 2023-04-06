/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { rendered, testRender } from "./util";
import { use, useState } from "@unis/core";

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

  let setMsgOutter: any;

  const App = () => {
    let [msg, setMsg] = useState("hello");

    use(() => {
      setMsgOutter = setMsg;
    });

    return () => (
      <div>
        App<span>{msg}</span>
      </div>
    );
  };

  testRender(<App />, root, true);

  expect(root.innerHTML).toBe("<div>App<span>hello</span></div>");

  setMsgOutter("world");

  await rendered();

  expect(root.innerHTML).toBe("<div>App<span>world</span></div>");
});
