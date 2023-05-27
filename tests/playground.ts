import AutomatedTask from "../src/AutomatedTask";
import NodeFileCachePlugin from "./NodeFileCachePlugin";
// import Scheduler from "../src/Scheduler";




// console.log(this)
function taskFactory() {
    // return async () => {
    //     const rndInt = Math.floor(Math.random() * 5) + 1

    //     if (rndInt == 1) {
    //         throw new Error('error from task')
    //     }


    //     const r = Math.random();
    //     // console.log(r)
    //     return r
    // }
    return async () => {
        return Math.random()
    }
}

(async () => {
    let counter = 0
    const config = {
        delay: 1000,
        numRepetitions: 20,
        taskFactory: taskFactory,
        onSuccess(r:any){
            counter++
            console.log(counter)
        },
        // startDate:getDate20SecondsInFuture()
    }
    const cache = new NodeFileCachePlugin('test.json')

    const task = new AutomatedTask(config);

    task.registerCachePlugin(cache)

    const report = await task.start()
    console.log(report)
    // const futureDate = getDate20SecondsInFuture();

    // const scheduler = new Scheduler(task,futureDate)

    // const report = await scheduler.schedule()
    // console.log(report)
    // const results = await task.start()
    // console.log(results)

})()


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