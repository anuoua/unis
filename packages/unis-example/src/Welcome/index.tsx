import { Link } from "@unis/router";
import s from "./index.module.css";

export const Welcome = () => {
  return () => (
    <Link to="main" className={s.msg}>
      Unis Todo
    </Link>
  );
};
