import { h, render, Fragment, useState, useProps } from "@unis/unis";
import { ToDo } from "./Todo";
import "./global.css";
import s from "./index.module.css";
import { useEffect } from "@unis/unis";

const Bpp = (props: { time: number; msg: string }) => {
  let { time, msg } = useProps(props);
  let [visible, setVisible] = useState(false);

  useEffect(
    () => {
      setVisible(true);
      setTimeout(() => {
        console.log("timeout");
        setVisible(false);
      }, 0);
    },
    () => []
  );

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
        <>
          {/* <Bpp time={0} msg="Bpp" /> */}
          {/* <Bpp time={1000} msg="Bpp2" /> */}
        </>
        {/* <Bpp time={1500} msg="Bpp3" /> */}
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
