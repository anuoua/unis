import { SchedulerJob } from "./type";

export const nextTick = <T extends (...params: any[]) => any>(cb: T) => {
  return queueMicrotask(cb);
};

let updateQueue: SchedulerJob[] = [];
let flushing = false;

export const flushQueue = () => {
  updateQueue.sort((a, b) => a.id! - b.id!);
  flushing = true;
  updateQueue.shift()?.(true);
  let job;
  while ((job = updateQueue.shift())) {
    job();
  }
  flushing = false;
};

export const addToQueue = (job: SchedulerJob) => {
  if (updateQueue.includes(job)) return;
  job.id = job.id ?? Number.MAX_SAFE_INTEGER;
  if (flushing) {
    const index = updateQueue.findIndex((j) => j.id! > job.id!);
    index === -1 ? updateQueue.push(job) : updateQueue.splice(index, 0, job);
  } else {
    updateQueue.push(job);
    updateQueue.length === 1 && nextTick(() => flushQueue());
  }
};
