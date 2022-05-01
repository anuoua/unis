/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { useEffect, useState } from "../src/api";
import { createPortal, Fragment, h } from "../src/h";
import { render } from "../src/render";
import { sleep } from "./util";

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
    let [visible, setVisible] = useState(false);

    useEffect(
      () => {
        setVisible(true);
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

  render(<App />, root);
  expect(document.body.innerHTML).toBe(
    "<div><div>hello</div></div><div></div>"
  );
  await sleep(1);
  expect(document.body.innerHTML).toBe(
    "<div><div>hello</div></div><div><main>hello dialog</main></div>"
  );
});
