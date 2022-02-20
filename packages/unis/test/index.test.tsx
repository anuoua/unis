/**
 * @vitest-environment jsdom
 */

import { test, beforeEach, afterEach } from "vitest";
import { use, useState } from "../src/api";
import { render } from "../src/render";

let root: Element;

beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
});

afterEach(() => {
  root.innerHTML = "";
});

test("test", (done) => {
  function toggleState(initial: boolean = true) {
    let [toggle, setToggle] = useState(initial);

    setTimeout(() => {
      try {
        setToggle(!toggle);
      } catch (e: any) {
        console.log(e.message);
      }
    });

    return () => [toggle];
  }

  function App() {
    let [toggle] = use(toggleState(true));

    return () => {
      console.log("App render");
      return toggle ? (
        <>
          <div>
            <span key={2}>2</span>
            <span key={1}>1</span>
            <span key={3}>3</span>
          </div>
        </>
      ) : (
        <div>
          <div>9999</div>
          <span key={4}>4</span>
          <span key={3}>3</span>
          <span key={1}>1</span>
        </div>
      );
    };
  }

  try {
    render(<App />, root);
    console.log(root.innerHTML);
  } catch (e: any) {
    console.log(e);
  }

  setTimeout(() => {
    console.log(root.innerHTML);
    done();
  }, 200);
});
