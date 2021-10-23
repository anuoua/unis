import {
  onMounted,
  onBeforeUnmount,
  onBeforeMount,
  onBeforeUpdate,
  onUpdated,
  onUnmounted,
  computed,
  reactive,
  toRefs,
} from "../build/esm/unis";
import { InnerMain } from "./InnerMain";

const useMouse = () => {
  const state = reactive({
    x: 0,
    y: 0,
  });

  const handleMove = (e: MouseEvent) => {
    state.x = e.clientX;
    state.y = e.clientY;
  };

  onMounted(() => {
    document.addEventListener("mousemove", handleMove);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("mousemove", handleMove);
  });

  return {
    ...toRefs(state),
  };
};

export const Main = (props: { name: string }) => {
  const name = computed(() => props.name);
  const state = reactive({
    text: "text",
  });

  const handleClick = () => {
    state.text = "哈哈哈哈";
  };

  onBeforeMount(() => {
    console.log("onBeforeMount Main");
  });
  onMounted(() => {
    console.log("onMounted Main");
  });
  onBeforeUpdate(() => {
    console.log("onBeforeUpdate Main");
  });
  onUpdated(() => {
    console.log("onUpdated Main");
  });
  onUnmounted(() => {
    console.log("onUnmounted Main");
  });
  onBeforeUnmount(() => {
    console.log("onBeforeUnmount Main");
  });
  return () => {
    // console.log("render Main");
    return (
      <div onClick={handleClick} style={{ border: "1px solid black" }}>
        {name.value}
        <br />
        {state.text}
        <InnerMain name={name.value + "Inner"} />
      </div>
    );
  };
};
