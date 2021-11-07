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
  document.body.innerHTML = '<div id="root"></div>';
  let container = document.querySelector("#root") as Element;

  beforeEach(() => {
    container.innerHTML = "";
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
      const el = ref<HTMLDivElement>();

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
            {/* @ts-ignore */}
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
            {/* @ts-ignore */}
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
        '<div class="red" attr3="3" style="background: red;" attr1="1"></div><div><span>3</span>index: 3<span>2</span>index: 2<span>1</span>index: 1</div><span>10</span>index: '
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
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    };

    render(<App />, container);

    nextTick(() => {
      expect(container.innerHTML).toBe(
        '<svg class="h-6 w-6" fill="none" view-box="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
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

  it("some", () => {
    const App = () => {
      const toggle = ref(true);

      onMounted(() => {
        toggle.value = false;
      });

      return () =>
        toggle.value ? (
          <Fragment>
            <Fragment key={1}></Fragment>
            <div></div>
          </Fragment>
        ) : (
          <Fragment>
            <span></span>
            <Fragment>
              <div></div>
            </Fragment>
            <Fragment key={1}></Fragment>
            <div></div>
          </Fragment>
        );
    };

    render(<App />, container);

    nextTick(() => {
      expect(container.innerHTML).toBe("<span></span><div></div><div></div>");
    });
  });
});
