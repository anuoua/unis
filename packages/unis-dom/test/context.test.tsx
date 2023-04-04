/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { useContext } from "@unis/core";
import { useEffect } from "@unis/core";
import { useProps } from "@unis/core";
import { useState } from "@unis/core";
import { createContext } from "@unis/core";
import { Fragment, h, memo } from "@unis/core";
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

it("context pass through", async () => {
  const AppContext = createContext({} as any);

  const App = () => {
    let [hello, setHello] = useState("hello");

    return () => (
      <AppContext.Provider value={{ hello, setHello }}>
        <div>
          <Bpp />
        </div>
      </AppContext.Provider>
    );
  };

  const Bpp = () => {
    let { hello, setHello } = useContext(AppContext);
    return () => <Cpp msg={hello} setMsg={setHello} />;
  };

  const Cpp = (p: { msg: string; setMsg: (msg: string) => void }) => {
    let { msg, setMsg } = useProps(p);
    let [count, setCount] = useState(0);

    useEffect(
      () => {
        setMsg("world");
        setCount(count + 1);
      },
      () => []
    );

    return () => msg;
  };

  render(<App />, root);

  expect(root.innerHTML).toBe("<div>hello</div>");

  await sleep(1);

  expect(root.innerHTML).toBe("<div>world</div>");
});
