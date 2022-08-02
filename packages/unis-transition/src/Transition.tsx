import { Fiber, findEls, use, useEffect, useProps, useState } from "@unis/unis";
import { debounce } from "./debounce";

export interface TransitionProps {
  children: JSX.Element;
  classNames: string;
  timeout: number;
  in: boolean;
  id?: number | string;
  unmountOnExit?: boolean;
}

enum STATUS {
  INITIAL = "initial",
  ENTERING = "entering",
  LEAVING = "leaving",
}

export const CSSTransition = (p: TransitionProps) => {
  let {
    children,
    timeout,
    in: inProp,
    classNames,
    unmountOnExit = false,
  } = useProps(p);
  let [currentChildren, setCurrentChildren] = useState(children);
  let [instance] = use((WF: Fiber) => [WF]);

  let status = STATUS.INITIAL;

  let cls = use(() => ({
    enter: `${classNames}-enter`,
    enterActive: `${classNames}-enter-active`,
    enterDone: `${classNames}-enter-done`,
    leave: `${classNames}-leave`,
    leaveActive: `${classNames}-leave-active`,
    leaveDone: `${classNames}-leave-done`,
  }));

  const switchChildren = debounce(() => {
    setCurrentChildren(inProp || !unmountOnExit ? children : null);

    const els = findEls(instance).filter(
      (el) => el instanceof HTMLElement
    ) as HTMLElement[];

    status === STATUS.ENTERING &&
      els.forEach((el) => {
        el.classList.replace(cls.enterActive, cls.enterDone);
      });
    status === STATUS.LEAVING &&
      els.forEach((el) => {
        el.classList.replace(cls.leaveActive, cls.leaveDone);
      });

    if (!unmountOnExit) {
      status === STATUS.LEAVING &&
        els.forEach((el) => {
          el.style.display = "none";
        });
    }
    status = STATUS.INITIAL;
  }, timeout);

  const enterAnimation = () => {
    const els = findEls(instance).filter(
      (el) => el instanceof HTMLElement
    ) as HTMLElement[];

    !unmountOnExit && els.forEach((el) => (el.style.display = ""));

    els.forEach((el) => el.classList.add(cls.enter));

    status === STATUS.INITIAL && els[0]?.offsetHeight;

    els.forEach((el) => {
      el.classList.remove(cls.leave, cls.leaveActive, cls.leaveDone);
      el.classList.replace(cls.enter, cls.enterActive);
    });
  };

  const leaveAnimation = () => {
    const els = findEls([instance]).filter(
      (el) => el instanceof HTMLElement
    ) as HTMLElement[];

    els.forEach((el) => el.classList.add(cls.leave));

    status === STATUS.INITIAL && els[0]?.offsetHeight;

    els.forEach((el) => {
      el.classList.remove(cls.enter, cls.enterActive, cls.enterDone);
      el.classList.replace(cls.leave, cls.leaveActive);
    });
  };

  useEffect(
    () => {
      if (inProp) {
        children === null && setCurrentChildren(children);
        enterAnimation();
        status = STATUS.ENTERING;
      } else {
        leaveAnimation();
        status = STATUS.LEAVING;
      }
      switchChildren();
    },
    () => [inProp]
  );

  return () => (inProp ? children : currentChildren);
};
