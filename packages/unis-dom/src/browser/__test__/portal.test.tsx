/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { useEffect } from "@unis/core";
import { useState } from "@unis/core";
import { createPortal, Fragment } from "@unis/core";
import { rendered, testRender } from "./util";

let root: Element;
let dialog: Element;

beforeEach(() => {
  root = document.createElement("div");
  dialog = document.createElement("div");
  document.body.append(root, dialog);
});

afterEach(() => {
  root.innerHTML = "";
  dialog.innerHTML = "";
});

it("portal", async () => {
  const App = () => {
    let [visible, setVisible] = useState(true);

    useEffect(
      () => {
        setVisible(false);
      },
      () => []
    );

    return () => (
      <Fragment>
        <div>hello</div>
        {visible && createPortal(<main>hello dialog</main>, dialog)}
      </Fragment>
    );
  };

  testRender(<App />, root);
  expect(document.body.innerHTML).toBe(
    "<div><div>hello</div></div><div><main>hello dialog</main></div>"
  );
  await rendered();
  expect(document.body.innerHTML).toBe(
    "<div><div>hello</div></div><div></div>"
  );
});
