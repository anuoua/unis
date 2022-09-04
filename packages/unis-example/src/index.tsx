import { h, render, Fragment, useProps, useState, useEffect } from "@unis/unis";
import { ToDo } from "./Todo";
import "./global.css";
import s from "./index.module.css";
import { BrowserRouter, Navigation, Outlet, Route, Routes } from "@unis/router";
import { Welcome } from "./Welcome";

// const Bpp = (props: { time: number; msg: string }) => {
//   let { time, msg } = useProps(props);
//   let [visible, setVisible] = useState(false);

//   useEffect(
//     () => {
//       setVisible(true);
//       setTimeout(() => {
//         console.log("timeout");
//         setVisible(false);
//       }, 0);
//     },
//     () => []
//   );

//   setTimeout(() => {
//     setVisible(true);
//   }, time);

//   return () => (visible ? <div>{msg}</div> : false);
// };

const App = () => {
  return () => (
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
        <Outlet />
      </div>
    </Fragment>
  );
};

render(
  <BrowserRouter>
    <Routes path="/" element={<App />}>
      <Route element={<Welcome />} />
      <Route path="main" element={<ToDo />} />
      <Route path="*" element={<Navigation to="main" />} />
    </Routes>
  </BrowserRouter>,
  document.querySelector("#root")!
);
