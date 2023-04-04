export function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export const rendered = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
