import { Link } from "@unis/router";
import { h } from "@unis/unis";
import s from "./index.module.css";

export const Welcome = () => {
  return () => (
    <Link to="main" className={s.msg}>
      Unis Todo
    </Link>
  );
};
