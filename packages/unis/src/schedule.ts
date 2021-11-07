export interface SchedulerJob extends Function {
  id?: number;
  isFirst?: boolean;
}

export function nextTick(cb: SchedulerJob) {
  return queueMicrotask(cb as VoidFunction);
}

let updateQueue: SchedulerJob[] = [];
let flushing = false;

export function flushQueue() {
  updateQueue.sort((a, b) => a.id! - b.id!);
  flushing = true;
  const firstJob = updateQueue.shift();
  if (firstJob) {
    firstJob.isFirst = true;
    firstJob();
    delete firstJob.isFirst;
  }
  let job;
  while ((job = updateQueue.shift())) {
    job();
  }
  flushing = false;
}

export function addToQueue(job: SchedulerJob, sync = false) {
  if (updateQueue.includes(job)) return;
  job.id = job.id ?? Number.MAX_SAFE_INTEGER;
  if (flushing) {
    const index = updateQueue.findIndex((j) => j.id! > job.id!);
    index === -1 ? updateQueue.push(job) : updateQueue.splice(index, 0, job);
  } else {
    updateQueue.push(job);
    if (updateQueue.length === 1) {
      sync ? flushQueue() : nextTick(() => flushQueue());
    }
  }
}
