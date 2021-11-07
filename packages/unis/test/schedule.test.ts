import { addToQueue, nextTick } from "../src/schedule";
import { SchedulerJob } from "../src/schedule";

type MockJob = SchedulerJob & jest.Mock;

describe("schedule", () => {
  it("job order", () => {
    const job1: MockJob = jest.fn(() => 1);
    job1.id = 0;
    addToQueue(job1);
    nextTick(() => {
      expect(job1.mock.results[0].value).toBe(1);
    });

    const arr: any[] = [];

    const job2: MockJob = jest.fn(() => arr.push(2));
    job2.id = 2;

    let job5: MockJob;
    let job6: MockJob;
    let job8: MockJob;
    let job11: MockJob;
    let job12: MockJob;

    const job3: MockJob = jest.fn(() => {
      job8 = jest.fn(() => arr.push(8));
      job8.id = 8;
      addToQueue(job8);

      job6 = jest.fn(() => arr.push(5.1));
      job6.id = 5;
      addToQueue(job6);

      job5 = jest.fn(() => arr.push(5));
      job5.id = 5;
      addToQueue(job5);

      job11 = jest.fn(() => arr.push(11));
      addToQueue(job11);

      job12 = jest.fn(() => arr.push(12));
      addToQueue(job12);

      arr.push(2.1);
    });
    job3.id = 2;

    const job4: MockJob = jest.fn(() => arr.push(4));
    job4.id = 4;

    const job7: MockJob = jest.fn(() => arr.push(7));
    job7.id = 7;

    const job9: MockJob = jest.fn(() => arr.push(9));
    const job10: MockJob = jest.fn(() => arr.push(10));

    addToQueue(job2);
    addToQueue(job3);
    addToQueue(job4);
    addToQueue(job7);
    addToQueue(job10);
    addToQueue(job9);

    nextTick(() => {
      expect(arr).toMatchObject([2, 2.1, 4, 5.1, 5, 7, 8, 10, 9, 11, 12]);
    });
  });
});
