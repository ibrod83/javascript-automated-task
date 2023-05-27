import expect from 'expect';
import { AutomatedTask } from '../src/index';
import { AutomatedTaskConfig, TaskFactory } from '../src/types';

describe('AutomatedTask', () => {


  it('should execute the task factory function the specified number of times', async () => {
    let count = 0;
    const mockFactory = () => {
      count++;
      return () => {

      };
    };
    const config = { numRepetitions: 3, delay: 0, taskFactory: mockFactory };
    const task = new AutomatedTask(config);
    await task.start();
    expect(count).toEqual(3);
  });

  it('should return the task report with the correct number of successful repetitions and errors', async () => {
    let count = 0;
    const mockFactory = () => {
      count++;
      if (count % 2 === 0) {
        return async () => 'success';
      } else {
        return async () => {
          throw new Error('failure');
        };
      }
    };
    const config = { numRepetitions: 4, delay: 0, taskFactory: mockFactory };
    const task = new AutomatedTask(config);
    const report = await task.start();
    expect(report.results).toEqual(['success', 'success']);
    // console.log(report.results)
    // expect(report.numSuccessfulRepetitions).toEqual(2);
    // expect(report.numErrors).toEqual(2);

  });

  it('should stop executing the task factory function if shouldStopOnError returns true', async () => {
    let count = 0;
    const mockFactory = () => {
      count++;
      return async () => {
        if (count === 2) {
          throw new Error('error');
        }
        return 'success';
      };
    };
    const config: AutomatedTaskConfig = {
      numRepetitions: 4,
      delay: 0,
      taskFactory: mockFactory,
      shouldStopOnError: () => count === 2,
    };
    const task = new AutomatedTask(config);
    const report = await task.start();
    expect(count).toEqual(2);
    expect(report.numSuccessfulRepetitions).toEqual(1);
    expect(report.numErrors).toEqual(1);
    expect(report.results).toEqual(['success']);
  });

  it('should delay execution between repetitions', async () => {
    const startTime = Date.now();
    const mockFactory = () => async () => { };
    const config = { numRepetitions: 3, delay: 1000, taskFactory: mockFactory };
    const task = new AutomatedTask(config);
    const report = await task.start();
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(2000);
    expect(report.results).toEqual([undefined, undefined, undefined]);
  });

  it('should return the expected data from the task factory', async () => {
    const mockData = { foo: 'bar' };
    const mockFactory = () => async () => mockData;
    const config = { numRepetitions: 1, delay: 0, taskFactory: mockFactory };
    const task = new AutomatedTask(config);
    const report = await task.start();
    expect(report.numSuccessfulRepetitions).toEqual(1);
    expect(report.numErrors).toEqual(0);
    expect(report.results).toEqual([mockData]);
  });

  it('should call shouldStopOnSuccess with the result of the task factory', async () => {
    const mockData = { foo: 'bar' };
    const mockFactory = () => async () => mockData;
    let resultFromHook;
    let counter=0;
    const config: AutomatedTaskConfig = {
      numRepetitions: 2,
      // delay: 0,
      taskFactory: mockFactory,
      shouldStopOnSuccess: (result) => {
        counter++;
        resultFromHook = result
        return true;
      },
    };
    const task = new AutomatedTask(config);
    await task.start();
    expect(resultFromHook).toEqual(mockData);
    expect(counter).toEqual(1);
  })

  it("should execute the bound function and maintain the correct context", async () => {
    class TestClass {
      value: number;

      constructor() {
        this.value = 42;
      }
    }

    const testInstance = new TestClass();

    const boundFunction = async function () {
      //@ts-ignore
      return this.value;
    }.bind(testInstance);

    const taskFactory: TaskFactory = () => boundFunction;

    const config: AutomatedTaskConfig = {
      numRepetitions: 3,
      delay: 100,
      taskFactory: taskFactory,
    };

    const automatedTask = new AutomatedTask(config);
    const taskReport = await automatedTask.start();

    expect(taskReport.numErrors).toBe(0);
    expect(taskReport.numSuccessfulRepetitions).toBe(3);
    expect(taskReport.results).toEqual([42, 42, 42]);
  });

  it("should stop after calling stop", async () => {
    const config: AutomatedTaskConfig = {
      numRepetitions: 5,
      delay: 10,
      taskFactory: () => async () => "success"
    };

    const automatedTask = new AutomatedTask(config);

    const promise = automatedTask.start();

    setTimeout(() => {
      automatedTask.stop();//
    }, 25); // Call stop() after 25ms

    const taskReport = await promise;//
    expect(taskReport.numSuccessfulRepetitions).toBeLessThan(config.numRepetitions as number);
    expect(taskReport.numErrors).toBe(0);
    expect(taskReport.results.includes('success')).toBe(true)
  });

  it('should pause and resume correctly', async () => {
    let executionCount = 0;
    const taskFactory = () => async () => {
      executionCount++;
    };

    const automatedTaskConfig = {
      numRepetitions: 5,
      delay: 10,
      taskFactory,
    };

    const automatedTask = new AutomatedTask(automatedTaskConfig);
    const prom = automatedTask.start();
    const start = Date.now()
    setTimeout(() => {
      automatedTask.pause();
    }, 10);//

    setTimeout(() => {//
      automatedTask.resume();
    }, 1200);

    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const taskReport = await prom;//
    const end = Date.now()
    const diff = end - start
    expect(diff).toBeGreaterThan(1200)
    expect(taskReport.numSuccessfulRepetitions).toBe(5)
    expect(executionCount).toBe(5);

  });

  it('should stop properly when stop() is called while being in a paused phase', async () => {
    const taskFactory = () => {
      return async () => {
        return 'success'
      };
    };

    const config: AutomatedTaskConfig = {
      numRepetitions: 5,
      delay: 100,
      taskFactory: taskFactory,
      shouldStopOnSuccess(result) {
        automatedTask.pause()
        return false
      }
    };

    var automatedTask = new AutomatedTask(config);

    const taskPromise = automatedTask.start();

    setTimeout(() => {
      automatedTask.stop();
    }, 1000);

    const taskReport = await taskPromise;
    expect(taskReport.numSuccessfulRepetitions).toBe(1); // Since we stopped it, the number of successful repetitions should be less than or equal to 4 (adjust if needed)
    expect(taskReport.numErrors).toBe(0);
    expect(taskReport.results).toEqual(['success'])
  });

  it('should execute without delay when no delay property is passed in the config', async () => {
    const startTime = Date.now();
    const mockFactory = () => async () => { };
    const config = { numRepetitions: 3, taskFactory: mockFactory };
    const task = new AutomatedTask(config);
    const report = await task.start();
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    expect(elapsedTime).toBeLessThanOrEqual(100); // Assumes that execution without delay should be within 100ms
    expect(report.results).toEqual([undefined, undefined, undefined]);
  });

  it('should call onError when an error occurs during task execution', async () => {
    let onErrorCalled = false;
    let error;
    const mockFactory = () => async () => {
      throw new Error('error');
    };
    const config: AutomatedTaskConfig = {
      numRepetitions: 2,
      delay: 0,
      taskFactory: mockFactory,
      onError(e) {
        onErrorCalled = true;
        error = e
      },
    };
    const task = new AutomatedTask(config);
   const report =  await task.start();
    expect(onErrorCalled).toEqual(true);
    expect(error.message).toEqual('error');
    expect(report.numErrors).toEqual(2);
  });

  it('should call onSuccess when a task is executed successfully', async () => {
    let onSuccessCalled = false;
    const results:any[] = []
    const mockFactory = () => async () => 'success';
    const config: AutomatedTaskConfig = {
      numRepetitions: 2,
      delay: 0,
      taskFactory: mockFactory,
      onSuccess(r) {
        results.push(r)
        onSuccessCalled = true;
      },
    };
    const task = new AutomatedTask(config);
    const report = await task.start();
    expect(onSuccessCalled).toEqual(true);
    expect(report.numSuccessfulRepetitions).toEqual(2);
    expect(results).toEqual(['success','success'])
  });

  it('should start the task at the specified startDate', async () => {
    const startDate = new Date(Date.now() + 1000); // Schedule the task to start 1 second from now
    const mockFactory = () => {
      return async () => {};
    };
    const config = { numRepetitions: 1, taskFactory: mockFactory,startDate };
    const task = new AutomatedTask(config);
    const start = Date.now()
    // await task.startScheduled({startDate});
    await task.start();
    const end = Date.now()
    const timeDifference = end - start;
    expect(timeDifference).toBeGreaterThanOrEqual(1000);//
  });

  it('should throw an error when startDate has already passed', async () => {
    const startDate = new Date(Date.now() - 1000); // Schedule the task to start 1 second before now
    const mockFactory = () => {
      return async () => {};
    };
    const config = { numRepetitions: 1, taskFactory: mockFactory, startDate };
    const task = new AutomatedTask(config);
  
    try {
      await task.start();
    } catch (error) {
      expect(error.message).toEqual('Start date must be in the future.');
    }
  });

});