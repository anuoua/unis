/**
 * @jest-environment jsdom
 */

import {
  onMounted,
  render,
  nextTick,
  computed,
  reactive,
  ref,
  Fragment,
  Teleport,
} from "../src/unis";

describe("index", () => {
  let container = null;
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    container = document.querySelector("#root");
  });

  it("render", () => {
    const Sub = (props: { key: any; children?: any }) => {
      return (
        <>
          <span>{props.key}</span>
          index: {props.children}
        </>
      );
    };
    const App = () => {
      const ul = reactive([1, 2, 3]);
      const toggle = ref(true);
      const el = ref();

      const prop = computed(() => {
        return toggle.value
          ? {
              attr2: "2",
              attr3: "3.1",
              style: { background: "blue" },
              className: "blue",
              onClick: () => {},
              onBlur: () => {},
            }
          : {
              attr1: "1",
              attr3: "3",
              style: { background: "red" },
              className: "red",
              onClick: () => {},
            };
      });

      onMounted(() => {
        ul.sort((a, b) => b - a);
        toggle.value = !toggle.value;
      });

      return () =>
        toggle.value ? (
          <Fragment>
            <div {...prop.value}></div>
            <div ref={el}>
              {ul.map((i) => (
                <Sub key={i}>{i}</Sub>
              ))}
            </div>
            <Sub key={4}></Sub>
          </Fragment>
        ) : (
          <Fragment>
            <div {...prop.value}></div>
            <div ref={el}>
              {ul.map((i) => (
                <Sub key={i}>{i}</Sub>
              ))}
            </div>
            <Sub key={10}></Sub>
          </Fragment>
        );
    };

    render(<App />, container);

    nextTick(() => {
      expect(container.innerHTML).toBe(
        '<div attr3="3" style="background: red;" class="red" attr1="1"></div><div><span>3</span>index: 3<span>2</span>index: 2<span>1</span>index: 1</div><span>10</span>index: '
      );
    });
  });

  it("svg", () => {
    const App = () => {
      const focusable = ref<"false" | "true">("false");

      onMounted(() => {
        focusable.value = "true";
      });

      return () => (
        <svg
          viewBox="0 0 1024 1024"
          focusable={focusable.value}
          data-icon="step-forward"
          width="1em"
          height="1em"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M676.4 528.95L293.2 829.97c-14.25 11.2-35.2 1.1-35.2-16.95V210.97c0-18.05 20.95-28.14 35.2-16.94l383.2 301.02a21.53 21.53 0 010 33.9M694 864h64a8 8 0 008-8V168a8 8 0 00-8-8h-64a8 8 0 00-8 8v688a8 8 0 008 8"></path>
        </svg>
      );
    };

    render(<App />, container);

    nextTick(() => {
      expect(container.innerHTML).toBe(
        '<svg viewBox="0 0 1024 1024" focusable="true" data-icon="step-forward" width="1em" height="1em" fill="currentColor" aria-hidden="true">' +
          '<path d="M676.4 528.95L293.2 829.97c-14.25 11.2-35.2 1.1-35.2-16.95V210.97c0-18.05 20.95-28.14 35.2-16.94l383.2 301.02a21.53 21.53 0 010 33.9M694 864h64a8 8 0 008-8V168a8 8 0 00-8-8h-64a8 8 0 00-8 8v688a8 8 0 008 8"></path></svg>'
      );
    });
  });

  it("teleport", () => {
    const App = () => {
      const toggle = ref(true);

      onMounted(() => {
        toggle.value = !toggle.value;
      });

      return () =>
        toggle.value ? (
          <Teleport to={container}>
            <div>teleport</div>
          </Teleport>
        ) : null;
    };

    render(<App />, container);

    nextTick(() => {
      expect(container.innerHTML).toBe("");
    });
  });

  it("teleport2", () => {
    const App = () => {
      const toggle = ref(true);
      onMounted(() => {
        toggle.value = !toggle.value;
      });
      return () =>
        toggle.value ? (
          <Teleport to={container}>
            <div key={1}>{1}</div>
            <div key={2}>{2}</div>
          </Teleport>
        ) : (
          <Teleport to={container}>
            <div key={2}>{2}</div>
            <span>3</span>
            <div key={1}>{1}</div>
          </Teleport>
        );
    };

    render(<App />, document.body);

    nextTick(() => {
      expect(container.innerHTML).toBe(
        '<div key="2">2</div><span>3</span><div key="1">1</div>'
      );
    });
  });
});
