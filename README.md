# Javascript Automated Task

Javascript Automated Task is a simple utility to manage and run tasks in a repeatable, configurable manner. It provides an easy-to-use interface to execute tasks with customizable options such as number of repetitions, delay between repetitions, stopping conditions, and more. In addition to these features, it also includes the ability to pause, resume, and stop tasks, giving you greater control over the execution flow.

This utility works both in the browser and in Node.js.

If you encounter any bugs or have a question, please don't hesitate to open an issue.


## Installation

To install the package, simply run:

```bash
npm install javascript-automated-task
```

# Table of Contents

- [Examples](#examples)
  - [Basic](#basic)
  - [Hook into errors](#hook-into-errors)
  - [Hook into successful repetitions](#hook-into-successful-repetitions)
  - [Pause and resume](#pause-and-resume)
  - [Stop](#stop)
        


## Examples

#### Basic



```javascript
   import { AutomatedTask, AutomatedTaskConfig, TaskFactory,TaskReport } from "javascript-automated-task";

   //Wrapping the code in an async IIFE just for the sake of the example 
   (async()=>{
      const myTaskFactory: TaskFactory = () => {
          return () => {
            // Your task logic here. For example, automated scrolling and collection of some data:
           
            window.scrollTo(0, document.body.scrollHeight);
            const result = document.querySelector('.someElement')
            return result//This will be added to an array of "results"

          };
        };

        const config: AutomatedTaskConfig = {
            numRepetitions: 5,//Repeat 5 times
            delay: 1000,//Delay of one second between each repetition
            taskFactory: myTaskFactory,     
        };

        const task = new AutomatedTask(config);

        const taskReport:TaskReport = await task.start()

        console.log('Done, this is the array of results from the report: ', taskReport.results)//Will print an array of results

   })() 
```

#### Hook into errors

If an exception is thrown during a repetition, the shouldStopOnError hook is called with the error object. If you return true from this hook, the repetition will stop (this allows customization of what should be considered "an error")


```javascript
   import { AutomatedTask, AutomatedTaskConfig, TaskFactory,TaskReport } from "javascript-automated-task";

   (async()=>{
      const myTaskFactory: TaskFactory = () => {
          return async () => {
            // Your task logic here
          };
        };

        const config: AutomatedTaskConfig = {
            numRepetitions: 5,//Repeat 5 times
            delay: 1000,//Delay of one second between each repetition
            taskFactory: myTaskFactory,
            shouldStopOnError(e:any){
              //analyze the error..

              if(e.code === 'NOT_AN_ERROR_I_CARE_ABOUT'){
                return false
              }else{
                return true
              }
            }     
        };

        const task = new AutomatedTask(config);

        const taskReport:TaskReport = await task.start()

   })() 
```

#### Hook into successful repetitions

A repetition that doesn't throw an error, is considered "successful", and the program will continue repeating the task. That said, you can still stop the repetition, based on some other criteria


```javascript
   import { AutomatedTask, AutomatedTaskConfig, TaskFactory,TaskReport } from "javascript-automated-task";

   (async()=>{
      const myTaskFactory: TaskFactory = () => {
          return async () => {
            // Your task logic here
          };
        };

        const config: AutomatedTaskConfig = {
            numRepetitions: 5,//Repeat 5 times
            delay: 1000,//Delay of one second between each repetition
            taskFactory: myTaskFactory,
            shouldStopOnSuccess(result:any){
              if(result === 'something i consider an error, and should stop the automation'){
                return true
              }
              return false
            }     
        };

        const task = new AutomatedTask(config);

        const taskReport:TaskReport = await task.start()
   })() 
```

#### Pause and resume

An automated task can be paused and resumed.


```javascript
   import { AutomatedTask, AutomatedTaskConfig, TaskFactory,TaskReport } from "javascript-automated-task";

   (async()=>{
      const myTaskFactory: TaskFactory = () => {
          return async () => {
            // Your task logic here
          };
        };

        const config: AutomatedTaskConfig = {
            numRepetitions: 5,//Repeat 5 times
            delay: 1000,//Delay of one second between each repetition
            taskFactory: myTaskFactory   
        };

        const task = new AutomatedTask(config);

        document.querySelector("#pause").addEventListener("click",()=>{
           task.pause()//Pause the automated task
        })

         document.querySelector("#resume").addEventListener("click",()=>{
           task.resume()//Resume the automated task
        })

        const prom = task.start();

         const taskReport = await prom;//Will be resolved after all iterations are complete, meaning
         //task.resume() was called, in this case.
   })() 
```

#### Stop

Unlike pause(), stop() will terminate the task repetition, and cause the task.start() promise to resolve

```javascript
   import { AutomatedTask, AutomatedTaskConfig, TaskFactory,TaskReport } from "javascript-automated-task";

   (async()=>{
      const myTaskFactory: TaskFactory = () => {
          return async () => {
            // Your task logic here
          };
        };

        const config: AutomatedTaskConfig = {
            numRepetitions: 500,//Repeat 500 times
            delay: 1000,//Delay of one second between each repetition
            taskFactory: myTaskFactory   
        };

        const task = new AutomatedTask(config);

        document.querySelector("#stop").addEventListener("click",()=>{
           task.stop()//Stop the automated task
        })

        const prom = task.start();

         const taskReport = await prom;//Will be resolved either when all repetitions are complete, or when stop() is called
   })() 
```


