/**
 * @jest-environment jsdom
 */
import { reactive } from "@vue/reactivity";
import { createContext } from "../src/context";
import { onMounted } from "../src/life";
import { render } from "../src/render";
import { nextTick } from "../src/schedule";

describe("Context", () => {
  document.body.innerHTML = '<div id="root"></div>';
  let container = document.querySelector("#root") as Element;

  beforeEach(() => {
    container.innerHTML = "";
  });

  it("get", () => {
    const Context = createContext(reactive({ hello: "name" }));

    function App() {
      const state = Context.getValue();

      onMounted(() => {
        state.hello = "world";
      });

      return () => <div>{state.hello}</div>;
    }

    render(
      <Context.Provider value={reactive({ hello: "hello" })}>
        <App />
      </Context.Provider>,
      container
    );

    nextTick(() => {
      expect(container.innerHTML).toBe("<div>world</div>");
    });
  });

  it("Consumer", () => {
    const Context = createContext(reactive({ hello: "name" }));

    function App() {
      const state = Context.getValue();

      onMounted(() => {
        state.hello = "world";
      });

      return () => (
        <Context.Consumer>{({ hello }) => <div>{hello}</div>}</Context.Consumer>
      );
    }

    expect(() => render(<App />, container)).toThrowError();

    render(
      <Context.Provider>
        <App />
      </Context.Provider>,
      container
    );

    nextTick(() => {
      expect(container.innerHTML).toBe("<div>world</div>");
    });
  });
});
