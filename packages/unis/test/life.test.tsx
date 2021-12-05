/**
 * @jest-environment jsdom
 */

import {
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
  render,
  nextTick,
  reactive,
  ref,
} from "../src/unis";

describe("life", () => {
  document.body.innerHTML = '<div id="root"></div>';
  let container = document.querySelector("#root") as Element;

  beforeEach(() => {
    container.innerHTML = "";
  });

  it("all life", async () => {
    const result: any[] = [];

    const Main = (props: { name: string }) => {
      onBeforeMount(() => {
        result.push("Main onBeforeMount");
      });
      onMounted(() => {
        result.push("Main onMounted");
      });
      onBeforeUpdate(() => {
        result.push("Main onBeforeUpdate");
      });
      onUpdated(() => {
        result.push("Main onUpdated");
      });
      onUnmounted(() => {
        result.push("Main onUnmounted");
      });
      onBeforeUnmount(() => {
        result.push("Main onBeforeUnmount");
      });
      onRenderTracked((e) => {
        result.push("Main onRenderTracked");
      });
      onRenderTriggered((e) => {
        result.push("Main onRenderTriggered");
      });

      return () => <div>Main Top Display: {props.name}</div>;
    };

    const App = () => {
      const toggle = ref(true);
      const name = ref("App");

      onBeforeMount(() => {
        result.push("App onBeforeMount");
      });
      onMounted(() => {
        name.value = "Main";
        nextTick(() => {
          toggle.value = !toggle.value;
        });
        result.push("App onMounted");
      });
      onBeforeUpdate(() => {
        result.push("App onBeforeUpdate");
      });
      onUpdated(() => {
        result.push("App onUpdated");
      });
      onUnmounted(() => {
        result.push("App onUnmounted");
      });
      onBeforeUnmount(() => {
        result.push("App onBeforeUnmount");
      });

      return () => (
        <div>
          App
          {toggle.value && <Main name={name.value} />}
        </div>
      );
    };

    render(<App />, container);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result).toMatchObject([
      "App onBeforeMount",
      "Main onBeforeMount",
      "Main onRenderTracked",
      "Main onMounted",
      "App onMounted",
      "App onBeforeUpdate",
      "Main onRenderTriggered",
      "Main onBeforeUpdate",
      "Main onUpdated",
      "App onUpdated",
      "App onBeforeUpdate",
      "Main onBeforeUnmount",
      "Main onUnmounted",
      "App onUpdated",
    ]);
  });

  it("error", () => {
    expect(() => onMounted(() => {})).toThrowError(
      `Don't call the life cycle api outside the component!`
    );
  });

  it("multi call", () => {
    const result: any[] = [];
    const App = () => {
      onMounted(() => result.push(1));
      onMounted(() => result.push(2));
      return () => null;
    };

    render(<App />, container);

    nextTick(() => {
      expect(result).toMatchObject([1, 2]);
    });
  });

  it("errorCaptured", () => {
    const Bpp = () => {
      let a = reactive({
        str: "str",
      });
      onMounted(() => {
        (a as any).str = 0;
      });
      return () => <div>{a.str.toLocaleUpperCase()}</div>;
    };

    const App = () => {
      const fallback = <div>fallback</div>;
      const error = ref(false);

      onErrorCaptured(() => {
        error.value = true;
        return false;
      });

      return () => (error.value ? fallback : <Bpp />);
    };

    render(<App />, container);

    nextTick(() => {
      expect(container.innerHTML).toBe("<div>fallback</div>");
    });
  });

  it("errorCaptured", () => {
    const Bpp = () => {
      let a: any;
      return () => <div>{a.str.toLocaleUpperCase()}</div>;
    };

    const App = () => {
      const fallback = <div>fallback</div>;
      const error = ref(false);

      onErrorCaptured(() => {
        error.value = true;
        return false;
      });

      return () => (error.value ? fallback : <Bpp />);
    };

    render(<App />, container);

    nextTick(() => {
      expect(container.innerHTML).toBe("<div>fallback</div>");
    });
  });
});
