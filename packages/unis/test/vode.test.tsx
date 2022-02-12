/**
 * @jest-environment jsdom
 */

import { render } from "../src/render";
import { nextTick } from "../src/schedule";
import { getId } from "../src/vode";

describe("utils", () => {
  document.body.innerHTML = '<div id="root"></div>';
  let container = document.querySelector("#root") as Element;

  beforeEach(() => {
    container.innerHTML = "";
  });

  it.only("getId", () => {
    let id = "";

    function Bpp() {
      id = getId();
      return () => <div></div>;
    }

    function App() {
      return () => (
        <>
          <div></div>
          <Bpp />
        </>
      );
    }

    render(<App />, container);

    nextTick(() => {
      expect(id).toBe("1:0:0:0");
    });
  });
});
