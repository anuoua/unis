/**
 * @jest-environment jsdom
 */
import {
  render,
  watchEffect,
  onMounted,
  onUpdated,
  watch,
  ref,
  nextTick,
  forceUpdator,
  nextTickUpdator,
} from "../src/unis";

describe("api test", () => {
  let container = document.body;

  beforeEach(() => {
    container.innerHTML = "";
  });

  it("watchEffect", () => {
    const result: any = [];

    const App = () => {
      const a = ref(false);

      watchEffect((onInvalidate) => {
        a.value;
        result.push("effect");
        onInvalidate(() => {
          result.push("effect clear");
        });
      });

      watchEffect(
        (onInvalidate) => {
          onInvalidate(() => {});
        },
        { flush: "post" }
      );

      const stop = watchEffect(
        (onInvalidate) => {
          a.value;
          result.push("sync");
          onInvalidate(() => {
            result.push("sync clear");
          });
        },
        { flush: "sync" }
      );

      onMounted(() => {
        a.value = true;
        stop();
        nextTick(() => {
          a.value = false;
        });
      });

      return () => a.value;
    };

    render(<App />, container);

    nextTick(() => {
      nextTick(() => {
        expect(result).toMatchObject([
          "effect",
          "sync",
          "sync clear",
          "sync",
          "sync clear",
          "effect clear",
          "effect",
          "effect clear",
          "effect",
        ]);
      });
    });
  });

  it("watch", () => {
    const result: any = [];

    const App = () => {
      const a = ref(false);
      const b = ref(0);

      watch(
        () => b.value,
        (old, cur) => {
          result.push(old, cur);
        }
      );

      watch(a, (old, cur, onInvalidate) => {
        result.push(old, cur);
        onInvalidate(() => {
          result.push("watch clear");
        });
      });

      onMounted(() => {
        a.value = true;
        b.value++;
        nextTick(() => {
          a.value = false;
        });
      });

      return () => String(a.value) + b.value;
    };

    render(<App />, container);

    nextTick(() => {
      nextTick(() => {
        expect(result).toMatchObject([
          0,
          1,
          false,
          true,
          "watch clear",
          true,
          false,
        ]);
      });
    });
  });

  it("update", () => {
    const result: any[] = [];

    const App = () => {
      const update = forceUpdator();
      const tickUpdate = nextTickUpdator();

      onMounted(() => {
        update();
        tickUpdate();
        result.push("middle");
      });

      onUpdated(() => {
        result.push("update");
      });

      return () => null;
    };

    render(<App />, container);

    nextTick(() => {
      expect(result).toMatchObject(["update", "middle", "update"]);
    });
  });
});
