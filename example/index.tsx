import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onUnmounted,
  onBeforeUnmount,
  Fragment,
  render,
  reactive,
  ref,
} from "../build/esm/unis";
import { Main } from "./Main";

const Root = () => {
  const state = reactive({
    title: "Example",
    mainName: "main",
  });

  const toggle = ref(true);

  const el = ref();

  const ul = reactive([1, 2, 3, 4, 5]);

  const handleClick = () => {
    toggle.value = !toggle.value;
    ul.sort((a, b) => (toggle.value ? a - b : b - a));
    state.mainName = "Hay Main" + Math.random();
  };

  onBeforeMount(() => {
    console.log("onBeforeMount Root");
  });
  onMounted(() => {
    console.log(el);
    console.log("onMounted Root");
  });
  onBeforeUpdate(() => {
    console.log("onBeforeUpdate Root");
  });
  onUpdated(() => {
    console.log("onUpdated Root");
  });
  onUnmounted(() => {
    console.log("onUnmounted Root");
  });
  onBeforeUnmount(() => {
    console.log("onBeforeUnmount Root");
  });

  return () => {
    // console.log("render Root");
    return (
      <Fragment>
        <h1 ref={el}>{state.title}</h1>
        <main onClick={handleClick}>
          {ul.map((i) => (
            <Fragment key={i}>
              <div>{i}</div>
              fragment: {i}
            </Fragment>
          ))}
          {toggle.value && <Main name={state.mainName} />}
          <span>kkkkkkkkdddd</span>
          <svg
            viewBox="0 0 1024 1024"
            focusable="false"
            data-icon="step-forward"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M676.4 528.95L293.2 829.97c-14.25 11.2-35.2 1.1-35.2-16.95V210.97c0-18.05 20.95-28.14 35.2-16.94l383.2 301.02a21.53 21.53 0 010 33.9M694 864h64a8 8 0 008-8V168a8 8 0 00-8-8h-64a8 8 0 00-8 8v688a8 8 0 008 8"></path>
          </svg>
        </main>
        <footer>footer</footer>
      </Fragment>
    );
  };
};

render(<Root />, document.querySelector("#root"));
