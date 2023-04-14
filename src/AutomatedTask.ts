import { createDeferred } from "./deferred";
import { AutomatedTaskConfig,  InitialTaskReport,  InternalAutomatedTaskConfig,  Schedule,  TaskReport,  } from "./types";


export default class AutomatedTask {

    private isStopped = false
    private pausedDeferred = createDeferred()

    config!: InternalAutomatedTaskConfig
    schedule?:Schedule
   

    constructor(config: AutomatedTaskConfig) {
        this.pausedDeferred.resolve()
        this.config = {
            delay: 0,
            numRepetitions:1,
            ...config
        };
    }

    

    async start() {
        const now = new Date()
        const taskReport: InitialTaskReport = {
            numErrors: 0,
            numSuccessfulRepetitions: 0,
            errors: [],
            results: [],
            startedAt:now,

        }
        taskReport.startedAt = now

        // if (this.config.startDate) {
        //     const delay = this.config.startDate.getTime() - now.getTime();
        //     if (delay > 0) {
        //         await timeout(delay);
        //     }
        // }

        for (let i = 0; i < this.config.numRepetitions; i++) {

            await this.pausedDeferred.promise
            if (this.isStopped) {
                break;
            }

            const promiseFactory = this.config.taskFactory()//

            try {

                const result = await promiseFactory()

                taskReport.results.push(result)//
                taskReport.numSuccessfulRepetitions++
                this.config.onSuccess && await this.config.onSuccess(result)
                this.config.shouldStopOnSuccess && await this.config.shouldStopOnSuccess(result)
                await timeout(this.config.delay)
            } catch (error) {
                taskReport.numErrors++
                taskReport.errors.push(error)
                this.config.onError && await this.config.onError(error)
                const shouldStop = this.config.shouldStopOnError ? await this.config.shouldStopOnError(error) : false
                if (shouldStop) {
                    break;
                }
            }

        }
        taskReport.completedAt = new Date()
        return taskReport as TaskReport
    }

    async startScheduled(schedule:Schedule){
        const now = new Date()
        if (schedule.startDate) {
            const delay = schedule.startDate.getTime() - now.getTime();
            if (delay > 0) {
                await timeout(delay);
            }
        }
        const report = await this.start()
        return report
    }

    stop() {
        this.isStopped = true
        this.pausedDeferred.resolve()
    }

    pause() {
        this.pausedDeferred = createDeferred()
    }

    resume() {
        this.pausedDeferred.resolve()
    }

    increaseDelay(mil: number = 100) {

        this.config.delay = this.config.delay as number + mil
    }

    decreaseDelay(mil: number = 100) {
        const diff = this.config.delay as number - mil
        if (mil < 0) {
            return
        }
        this.config.delay = diff
    }
}


function timeout(milliseconds: number) {//
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}


// (async()=>{
//     while(true){
//         // await timeout(50)
//         // console.log(Math.random())
//         await createFakePromise()
//     }
// })()



// function createFakePromise(){
//     return Promise.resolve()
// }

