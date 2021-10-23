/**
 * @jest-environment jsdom
 */

import {
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
  render,
  nextTick,
  ref,
} from "../src/unis";

describe("life", () => {
  let container = null;
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    container = document.querySelector("#root");
  });

  it("all life", async () => {
    const result = [];

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
      "Main onMounted",
      "App onMounted",
      "App onBeforeUpdate",
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
    const result = [];
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
});
