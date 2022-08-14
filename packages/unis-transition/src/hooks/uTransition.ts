import { use, useEffect, useState } from "@unis/unis";

export const UNMOUNTED = "unmounted";
export const APPEARING = "appearing";
export const APPEARED = "appeared";
export const ENTERING = "entering";
export const ENTERED = "entered";
export const EXITING = "exiting";
export const EXITED = "exited";

export type TimeoutObject = {
  appear?: number;
  enter?: number;
  exit?: number;
};

export type TransitionTimeout = number | TimeoutObject;

export interface uTransitionProps {
  in?: boolean;
  enter?: boolean;
  unmountOnExit?: boolean;
  mountOnEnter?: boolean;
  appear?: boolean;
  timeout?: TransitionTimeout;
}

export const uTransition = (optsFn: () => uTransitionProps) => {
  let {
    in: inProp = false,
    enter = true,
    unmountOnExit = true,
    mountOnEnter = true,
    timeout = 0,
    appear = false,
  } = use(optsFn);

  let timer: number;
  let mounted = false;

  let realMountOnEnter = use(() => (unmountOnExit ? true : mountOnEnter));
  let timeoutObject = use(() => {
    if (typeof timeout === "number") {
      return {
        appear: timeout,
        enter: timeout,
        exit: timeout,
      } as TimeoutObject;
    } else {
      const enter = timeout.enter ?? 0;
      return {
        appear: enter,
        enter,
        exit: timeout.exit ?? 0,
      } as TimeoutObject;
    }
  });

  let [childrenState, setChildrenState] = useState(
    !realMountOnEnter ? true : inProp
  );

  let initialStatus = UNMOUNTED;

  {
    if (childrenState) {
      if (appear && inProp) initialStatus = enter ? APPEARING : ENTERED;
      if (initialStatus === APPEARING) {
        setTimer(timeoutObject.appear!);
      }
    }
  }

  let [status, setStatus] = useState(initialStatus);

  const switchChildren = () => {
    if (status === ENTERING) setStatus(ENTERED);
    if (status === EXITING) setStatus(EXITED);
    if (status === APPEARING) setStatus(APPEARED);
    setChildrenState(inProp ? true : !unmountOnExit);
  };

  function setTimer(statusTimeout: number) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      switchChildren();
    }, statusTimeout);
  }

  useEffect(
    () => {
      if (!mounted) {
        mounted = true;
        return;
      }
      if (inProp) {
        if (!enter) return setStatus(ENTERED);
        setStatus(ENTERING);
        setChildrenState(true);
        childrenState = true;
        setTimer(timeoutObject.enter!);
      } else {
        setStatus(EXITING);
        setTimer(timeoutObject.exit!);
      }
    },
    () => [inProp]
  );

  return () => ({
    childrenState,
    status,
  });
};
