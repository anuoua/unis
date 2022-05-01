/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { useEffect, useState } from "../src/api";
import { createContext, useContext } from "../src/context";
import { Fragment, h, memo } from "../src/h";
import { render } from "../src/render";
import { sleep } from "./util";

let root: Element;

beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
});

afterEach(() => {
  root.innerHTML = "";
});

it("context", async () => {
  const AppContext = createContext<string>("initial");

  const Cpp = memo(() => {
    let theme = useContext(AppContext);

    return () => <div>Cpp: {theme}</div>;
  });

  const Dpp = () => {
    return () => (
      <AppContext.Consumer>
        {(theme) => <div>Dpp: {theme}</div>}
      </AppContext.Consumer>
    );
  };

  const Epp = () => {
    return () => (
      <AppContext.Consumer>
        {(theme) => <div>Epp: {theme}</div>}
      </AppContext.Consumer>
    );
  };

  const Bpp = () => {
    let theme = useContext(AppContext);

    return () => (
      <div>
        Bpp: {theme}
        <AppContext.Provider value="gray">
          <Cpp />
        </AppContext.Provider>
      </div>
    );
  };

  const App = () => {
    let [theme, setTheme] = useState("light");

    useEffect(
      () => {
        setTheme("dark");
      },
      () => []
    );

    return () => (
      <Fragment>
        <AppContext.Provider value={theme}>
          <div>App</div>
          <Bpp />
          <Dpp />
        </AppContext.Provider>
        <Epp />
      </Fragment>
    );
  };

  render(<App />, root);

  expect(root.innerHTML).toBe(
    "<div>App</div><div>Bpp: light<div>Cpp: gray</div></div><div>Dpp: light</div><div>Epp: initial</div>"
  );

  await sleep(1);

  expect(root.innerHTML).toBe(
    "<div>App</div><div>Bpp: dark<div>Cpp: gray</div></div><div>Dpp: dark</div><div>Epp: initial</div>"
  );
});
