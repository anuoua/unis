import {
  h,
  Fragment,
  render,
  ref,
  onMounted,
  nextTick,
  watchEffect,
} from "@unis/unis";
import { ToDo } from "./Todo/Todo";
import "./global.css";
import s from "./index.module.css";

const App = () => {
  const a = ref(false);

  watchEffect(() => {
    console.log(a.value);
  });

  // watch(a, (pre, cur) => {
  //   console.log(pre, cur);
  // });

  onMounted(() => {
    a.value = true;
    nextTick(() => {
      a.value = false;
    });
  });

  return () => {
    console.log("render");
    return (
      <Fragment>
        <div className={`${s.background_img} absolute h-full w-full`}></div>
        <div
          className={`flex justify-center flex-col-reverse items-center h-full relative backdrop-filter backdrop-blur-lg`}
        >
          <ToDo></ToDo>
        </div>
      </Fragment>
    );
  };
};

render(<App />, document.querySelector("#root"));
