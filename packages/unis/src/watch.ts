import {
  // enableTracking,
  isRef,
  ReactiveEffect,
  Ref,
  // resetTracking,
} from "@vue/reactivity";
import { onBeforeUpdate, onUpdated } from "./life";

interface Options {
  flush: "pre" | "post" | "sync";
}

export function watchEffect(
  fn: (onInvalidate: (clear: () => void) => void) => void,
  options?: Options
) {
  const { flush = "pre" } = options ?? {};
  let clearFn: Function;
  let run: Function | null = null;
  const onInvalidate = (cb: Function) => (clearFn = cb);

  function freshRun() {
    clearFn?.();
    effect.run();
    run = null;
  }

  const effect = new ReactiveEffect(
    () => {
      fn(onInvalidate);
    },
    () => {
      run = freshRun;
      if (flush === "sync") {
        run();
      }
    }
  );
  run = freshRun;
  run();

  effect.onStop = () => {
    clearFn?.();
  };

  if (flush === "pre") {
    onBeforeUpdate(() => run?.());
  }

  if (flush === "post") {
    onUpdated(() => run?.());
  }
  return () => {
    run = null;
    effect.stop();
  };
}

export function watch<T>(
  source: Ref<T> | (() => T),
  callback: (pre: T, cur: T, onInvalidate: Function) => void,
  options?: Options
) {
  let initial = false;
  let getter: () => T;
  let pre: T;

  if (isRef(source)) {
    getter = () => source.value;
  } else {
    getter = () => source();
  }

  return watchEffect((onInvalidate: Function) => {
    if (initial) return callback(pre, (pre = getter()), onInvalidate);
    pre = getter();
    initial = true;
  }, options);
}
