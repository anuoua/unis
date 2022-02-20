import { h, render, Fragment, useState, useProps } from "@unis/unis";
import { ToDo } from "./Todo";
import "./global.css";
import s from "./index.module.css";

const Bpp = (props: { time: number; msg: string }) => {
  let { time, msg } = useProps(props);
  let [visible, setVisible] = useState(false);

  setTimeout(() => {
    setVisible(true);
  }, time);

  return () => (visible ? <div>{msg}</div> : false);
};

const App = () => {
  return () => {
    console.log("render");
    return (
      <Fragment>
        <div className={`${s.background_img} absolute h-full w-full`}></div>
        {/* <>
          <Bpp time={500} msg="Bpp" />
          <Bpp time={1000} msg="Bpp2" />
        </>
        <Bpp time={1500} msg="Bpp3" /> */}
        <div
          className={`flex justify-center flex-col items-center h-full relative backdrop-filter backdrop-blur-lg`}
        >
          <ToDo />
        </div>
      </Fragment>
    );
  };
};

render(<App />, document.querySelector("#root")!);
