/**
 * @jest-environment jsdom
 */

import { ref, Fragment, onMounted, render, nextTick } from "../src/unis";

describe("updateChildren", () => {
  let container = null;
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    container = document.querySelector("#root");
  });

  it("updateChildren", () => {
    const App = () => {
      const toggle = ref(true);

      onMounted(() => {
        toggle.value = !toggle.value;
      });

      return () =>
        toggle.value ? (
          <Fragment>
            <Fragment>
              <div key={1}>1</div>
              <div key={2}>2</div>
              <div key={3}>3</div>
              <div key={4}>4</div>
              <div key={5}>5</div>
              <div key={6}>6</div>
              <div key={7}>7</div>
              <div key={8}>8</div>
              <div key={9}>9</div>
              <div key={10}>10</div>
            </Fragment>
            <div></div>
          </Fragment>
        ) : (
          <Fragment>
            <Fragment>
              <div key={1}>1</div>
              <div key={9}>9</div>
              <span></span>
              <div key={4}>4</div>
              <div key={6}>6</div>
              <div key={7}>7</div>
              <div key={3}>3</div>
              <p key={5}>5</p>
              <div key={8}>8</div>
              <div key={2}>2</div>
              <div key={10}>10</div>
            </Fragment>
            <div>
              <span key={1}>1</span>
              <span key={2}>2</span>
            </div>
          </Fragment>
        );
    };

    render(<App />, container);

    nextTick(() => {
      expect(container.innerHTML).toBe(
        `<div key="1">1</div><div key="9">9</div><span></span><div key="4">4</div><div key="6">6</div><div key="7">7</div><div key="3">3</div><p key="5">5</p><div key="8">8</div><div key="2">2</div><div key="10">10</div><div><span key="1">1</span><span key="2">2</span></div>`
      );
    });
  });
});
