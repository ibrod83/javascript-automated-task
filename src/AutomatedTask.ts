import { createDeferred } from "./deferred";
import { AutomatedTaskConfig, CREATED, FINISHED, PAUSED, RUNNING, TaskReport, TaskState } from "./types";


export default class AutomatedTask {

    private isStopped = false
    private pausedDeferred = createDeferred()

    config!: AutomatedTaskConfig
    taskReport!: TaskReport
    taskState: TaskState = CREATED;

    constructor(config: AutomatedTaskConfig) {
        this.pausedDeferred.resolve()
        this.config = {
            delay: 0,
            ...config
        };
        this.taskReport = {
            numErrors: 0,
            numSuccessfulRepetitions: 0,
            errors: [],
            results: []
        }
    }


    async start() {

        if (this.config.startDate) {
            const now = new Date();
            const delay = this.config.startDate.getTime() - now.getTime();
            if (delay > 0) {
                await timeout(delay);
            }
        }
        this.taskState = RUNNING

        for (let i = 0; i < this.config.numRepetitions; i++) {

            await this.pausedDeferred.promise
            if (this.isStopped) {
                break;
            }

            const promiseFactory = this.config.taskFactory()//

            try {

                const result = await promiseFactory()

                this.taskReport.results.push(result)//
                this.taskReport.numSuccessfulRepetitions++
                this.config.onSuccess && await this.config.onSuccess(result)
                this.config.shouldStopOnSuccess && await this.config.shouldStopOnSuccess(result)
                await timeout(this.config.delay as number)
            } catch (error) {
                this.taskReport.numErrors++
                this.taskReport.errors.push(error)
                this.config.onError && await this.config.onError(error)
                const shouldStop = this.config.shouldStopOnError ? await this.config.shouldStopOnError(error) : false
                if (shouldStop) {
                    break;
                }
            }

        }
        this.taskState = FINISHED
        return this.taskReport
    }

    stop() {
        this.isStopped = true
        this.taskState = FINISHED
        this.pausedDeferred.resolve()
    }

    pause() {
        this.taskState = PAUSED
        this.pausedDeferred = createDeferred()
    }

    resume() {       
        this.pausedDeferred.resolve()
        this.taskState = RUNNING
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

