import { findEls, use, useLayoutEffect, useProps } from "@unis/unis";
import { uInstance } from "./hooks/uInstance";
import {
  APPEARED,
  APPEARING,
  ENTERED,
  ENTERING,
  EXITED,
  EXITING,
  TransitionTimeout,
  uTransition,
} from "./hooks/uTransition";
import { uWatch } from "./hooks/uWatch";

export interface TransitionProps {
  children: JSX.Element;
  classNames: string;
  timeout: TransitionTimeout;
  in: boolean;
  id?: number | string;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  appear?: boolean;
  enter?: boolean;
  onEnter?: (el: HTMLElement) => void;
  onEntering?: (el: HTMLElement) => void;
  onEntered?: (el: HTMLElement) => void;
  onExit?: (el: HTMLElement) => void;
  onExiting?: (el: HTMLElement) => void;
  onExited?: (el?: HTMLElement) => void;
}

export const CSSTransition = (p: TransitionProps) => {
  let {
    children,
    timeout,
    in: inProp,
    classNames,
    unmountOnExit,
    mountOnEnter,
    appear,
    enter,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
  } = useProps(p);

  let [instance] = use(uInstance());

  let { childrenState, status } = use(
    uTransition(() => ({
      inProp,
      timeout,
      enter,
      unmountOnExit,
      mountOnEnter,
      appear,
    }))
  );

  let currentChildren = use(() => (childrenState ? children : null));

  let cls = use(() => ({
    appear: `${classNames}-appear`,
    appearActive: `${classNames}-appear-active`,
    appearDone: `${classNames}-appear-done`,
    enter: `${classNames}-enter`,
    enterActive: `${classNames}-enter-active`,
    enterDone: `${classNames}-enter-done`,
    exit: `${classNames}-exit`,
    exitActive: `${classNames}-exit-active`,
    exitDone: `${classNames}-exit-done`,
  }));

  let el: HTMLElement | undefined;

  const getElement = () => {
    const els = findEls(instance).filter(
      (el) => el instanceof HTMLElement
    ) as HTMLElement[];
    return els[0] as HTMLElement | undefined;
  };

  const clearAll = () => {
    if (!el) return;
    el.classList.remove(
      cls.appear,
      cls.appearActive,
      cls.appearDone,
      cls.enter,
      cls.enterActive,
      cls.enterDone,
      cls.exit,
      cls.exitActive,
      cls.exitDone
    );
  };

  const entered = (appear: boolean) => {
    if (!el) return;
    clearAll();
    el.classList.add(appear ? cls.appearDone : cls.enterDone);
    onEntered?.(el);
  };

  const exited = () => {
    if (el) {
      clearAll();
      el.classList.add(cls.exitDone);
    }
    onExited?.(el);
  };

  const entering = (reflow = false, apear: boolean) => {
    if (!el) return;

    clearAll();

    el.classList.add(apear ? cls.appear : cls.enter);

    onEnter?.(el);

    reflow && forceReflow(el);

    clearAll();

    el.classList.add(apear ? cls.appearActive : cls.enterActive);

    onEntering?.(el);
  };

  const exiting = (reflow = false) => {
    if (!el) return;

    clearAll();

    el.classList.add(cls.exit);

    onExit?.(el);

    reflow && forceReflow(el);

    clearAll();

    el.classList.add(cls.exitActive);

    onExiting?.(el);
  };

  useLayoutEffect(
    () => {
      el = getElement();
    },
    () => [status, inProp]
  );

  uWatch(
    (current, previous) => {
      switch (current) {
        case APPEARING:
          entering(previous !== EXITING, true);
          break;
        case APPEARED:
          entered(true);
          break;
        case ENTERING:
          entering(previous !== EXITING, false);
          break;
        case EXITING:
          exiting(previous !== ENTERING);
          break;
        case ENTERED:
          entered(false);
          break;
        case EXITED:
          exited();
          break;
      }
    },
    () => [status],
    { immediately: true, layout: true }
  );

  return () => currentChildren;
};

const forceReflow = (el: HTMLElement) => el.scrollTop;
