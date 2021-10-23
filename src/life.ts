import { ComponentVode } from "./vode";

let currentComponentVode: ComponentVode | null = null;

export const setCurrentComponentVode = (vode: ComponentVode | null) => {
  currentComponentVode = vode;
};

export const regist = (key: string, callback: Function) => {
  if (!currentComponentVode) {
    throw new Error("Don't call the life cycle api outside the component!");
  } else {
    if (currentComponentVode.life[key]) {
      currentComponentVode.life[key].push(callback);
    } else {
      currentComponentVode.life[key] = [callback];
    }
  }
};

export const onBeforeMount = (callback: Function) =>
  regist(onBeforeMount.name, callback);

export const onMounted = (callback: Function) =>
  regist(onMounted.name, callback);

export const onBeforeUpdate = (callback: Function) =>
  regist(onBeforeUpdate.name, callback);

export const onUpdated = (callback: Function) =>
  regist(onUpdated.name, callback);

export const onBeforeUnmount = (callback: Function) =>
  regist(onBeforeUnmount.name, callback);

export const onUnmounted = (callback: Function) =>
  regist(onUnmounted.name, callback);

// export const onErrorCaptured = (callback: Function) =>
//   regist(onErrorCaptured.name, callback);

// export const onRenderTracked = (callback: Function) =>
//   regist(onRenderTracked.name, callback);

// export const onRenderTriggered = (callback: Function) =>
//   regist(onRenderTriggered.name, callback);

// export const onActivated = (callback: Function) =>
//   regist(onActivated.name, callback);

// export const onDeactivated = (callback: Function) =>
//   regist(onDeactivated.name, callback);
