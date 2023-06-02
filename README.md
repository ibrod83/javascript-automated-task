# Javascript Automated Task

Javascript Automated Task is a simple utility to manage and run tasks in a repeatable, configurable manner. It provides an easy-to-use interface to execute tasks with customizable options such as number of repetitions, delay between repetitions, stopping conditions, scheduling and more. In addition to these features, it also includes the ability to pause, resume, and stop tasks, giving you greater control over the execution flow.

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
  - [onError and onSuccess hooks](#onerror-and-onsuccess-hooks)
  - [Decide if to stop in case of an error](#decide-if-to-stop-in-case-of-an-error)
  - [Decide if to stop in case of a successful repetition](#decide-if-to-stop-in-case-of-a-successful-repetition)
  - [Pause and resume](#pause-and-resume)
  - [Stop](#stop)
  - [Increase and decrease speed](#increase-and-decrease-speed)
  - [Schedule the task](#schedule-the-task)
  - [Run at a certain time every day](#Run-at-a-certain-time-every-day)
- [Persisting state](#persisting-state)  
        


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
            delay: 1000,//Delay of one second between each repetition. Default is 0
            taskFactory: myTaskFactory,     
        };

        const task = new AutomatedTask(config);

        const taskReport:TaskReport = await task.start()

        console.log('Done, this is the array of results from the report: ', taskReport.results)//Will print an array of results

   })() 
```



#### onError and onSuccess hooks

the program doesn't quit when an error occurs. Instead, it exposes an onError hook

```javascript
   import { AutomatedTask, AutomatedTaskConfig, TaskFactory,TaskReport } from "javascript-automated-task";

   //Wrapping the code in an async IIFE just for the sake of the example 
   (async()=>{
      const myTaskFactory: TaskFactory = () => {
          return () => {
            // Your task logic here
          };
        };

        const config: AutomatedTaskConfig = {
            numRepetitions: 5,//Repeat 5 times
            taskFactory: myTaskFactory,
            onError(e){//Hook into every error and get the Error object
              console.log(e)
            },
            onSuccess(result){
              console.log(result)//hook into each successful iteration, and get the result
            }     
        };

        const task = new AutomatedTask(config);

        const taskReport:TaskReport = await task.start()

   })() 
```

#### Decide if to stop in case of an error

(This hook is called after onError)

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

#### Decide if to stop in case of a successful repetition

(This hook is called after onSuccess)

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

#### Increase and decrease speed

You can change the delay between each repetition, even after the automated task has started

```javascript
   import { AutomatedTask, AutomatedTaskConfig, TaskFactory,TaskReport } from "javascript-automated-task";

   (async()=>{
      const myTaskFactory: TaskFactory = () => {
          return () => {
            // Your task logic here
          };
        };

        const config: AutomatedTaskConfig = {
            numRepetitions: 500,//Repeat 500 times
            delay: 1000,//Set the delay to one second initially
            taskFactory: myTaskFactory   
        };

        const task = new AutomatedTask(config);

        document.querySelector("#faster").addEventListener("click",()=>{
           task.decreaseDelay(100)//Decrease by 100 milliseconds
        })

        document.querySelector("#slower").addEventListener("click",()=>{
           task.increaseDelay(100)//Increase by 100 milliseconds
        })      

         const taskReport = await task.start();
   })() 
```

#### Schedule the task

You can schedule the task, by providing a Date object via the optional startDate property of the AutomatedTaskConfig

```javascript
   import { AutomatedTask, AutomatedTaskConfig, TaskFactory,TaskReport } from "javascript-automated-task";

   (async()=>{

      //Just an example...
      function getDate20SecondsInFuture() {
          // Get the current date and time
          const now = new Date();
        
          // Add 20 seconds to the current time
          const futureTime = now.getTime() + 20 * 1000;
        
          // Create a new Date object with the future time
          const futureDate = new Date(futureTime);
        
          // Return the future Date object
          return futureDate;
       }

      const taskFactory: TaskFactory = () => {
          return () => {
            return "hey"
          };
        };

        const config: AutomatedTaskConfig = {
            delay: 100,
            numRepetitions: 10,
            taskFactory,
            onSuccess(r:any){
                console.log(r)
            },
            startDate:getDate20SecondsInFuture() 
        };

        const task = new AutomatedTask(config);   

        const taskReport = await task.start();//Will start in 20 seconds
   })() 
```


#### Run at a certain time every day
If you want the task to be repeated at a certain time every day, you can use a combination of startDate and delay


```javascript
   import { AutomatedTask, AutomatedTaskConfig, TaskFactory,TaskReport } from "javascript-automated-task";

   (async()=>{

      //Lets say you want this to start on January 1st 2023, 9am
      const date = new Date(2023, 0, 1, 9, 0, 0);

      const taskFactory: TaskFactory = () => {
          return () => {
            return "hey"
          };
        };

        const millisecondsIn24Hours = 24*60*60*1000 

        const config: AutomatedTaskConfig = {
            delay: millisecondsIn24Hours,
            numRepetitions: 7,//Will continue for one week
            taskFactory,
            onSuccess(r:any){
                console.log(r)
            },
            startDate:date 
        };

        const task = new AutomatedTask(config);   

        const taskReport = await task.start();//Will continue for one week, unless manually stopped before, every day at 9am.
   })() 
```

## Persisting state
If your process dies for some reason, you might want the task to continue from its previous state, once the program comes back to life again.
For that, you can use the PersistencePlugin interface. This allows you to implement your own persistence state mechanism, and register it with the program.


```javascript
//  Every persistence plugin must implement this interface:
 PersistencePlugin {
    getState: () => Promise<State>
    setState: (state: State) => Promise<void>
}
// Your underlying storage/memory MUST include at least "isFirstRun" property, with a value of true, for the first run.
// It must be able to accommodate the entire State interface(If you are using SQL, all columns must be present in the table, for this to work)
// This is the State type:

type State = {
    isFirstRun: boolean//IMPORTANT: This must be set to true initially, otherwise the mechanism wont work.
    hasFinished: boolean
    wasManuallyStopped: boolean
    numErrors: number
    numSuccessfulRepetitions: number
    results: any[]
    errors: any[]
    startedAt: Date | null
    completedAt: Date | null
}

//An example implementation of a persistence plugin, using the file system:

import { State, PersistencePlugin } from "../../src/types";
import fs from 'fs'
import util from 'util'
const writeFile = util.promisify(fs.writeFile)

export default class NodeFilePersistencePlugin implements PersistencePlugin {
    path: string
    constructor(path: string) {
        this.path = path
    }     
    async getState() {
        if (!fs.existsSync(this.path)) {
            const state: Partial<State> = {
                isFirstRun: true,
            }
            await this.setState(state as State) 
        }

        const readFile = util.promisify(fs.readFile)
        const fileContents = await readFile(this.path, 'utf8')
        return JSON.parse(fileContents) as State
    }
    async setState(state: State) {       
        await writeFile(this.path, JSON.stringify(state), 'utf8')
    }  
}   

//Usage of the plugin:

    const persistence = new NodeFilePersistencePlugin(path.join(__dirname, 'test.json'));//Instance of the plugin we defined above    

    const task = new AutomatedTask({
        delay: 50,
        numRepetitions: 20,
        taskFactory: ()=>async()=>{console.log('task!')},
    });

    task.registerPersistencePlugin(persistence)//Register the plugin

    const report = await task.start()


```
