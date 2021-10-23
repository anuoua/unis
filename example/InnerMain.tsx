import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onUnmounted,
  onBeforeUnmount,
  Teleport,
  computed,
  ref,
} from "../build/esm/unis";

export const InnerMain = (props: { name: string }) => {
  const name = computed(() => props.name);
  const toggle = ref(true);

  const handleToggle = () => {
    toggle.value = !toggle.value;
  };

  onBeforeMount(() => {
    console.log("onBeforeMount InnerMain");
  });
  onMounted(() => {
    console.log("onMounted InnerMain");
  });
  onBeforeUpdate(() => {
    console.log("onBeforeUpdate InnerMain");
  });
  onUpdated(() => {
    console.log("onUpdated InnerMain");
  });
  onUnmounted(() => {
    console.log("onUnmounted InnerMain");
  });
  onBeforeUnmount(() => {
    console.log("onBeforeUnmount InnerMain");
  });
  return () => {
    // console.log("render InnerMain");
    return toggle.value ? (
      <Teleport to={document.body}>
        <div
          style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            background: "gray",
            opacity: "0.4",
            left: 0,
            top: 0,
          }}
          onClick={handleToggle}
        >
          teleport
        </div>
      </Teleport>
    ) : (
      <div onClick={handleToggle}>NO TELTEPORT</div>
    );
  };
};
