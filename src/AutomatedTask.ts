import { createDeferred } from "./deferred";
import { AutomatedTaskConfig, TaskReport } from "./types";


export default class AutomatedTask {

    config!: AutomatedTaskConfig
    taskReport!: TaskReport
    private isStopped = false

    private pausedDeferred = createDeferred()

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
                this.config.shouldStopOnSuccess && await this.config.shouldStopOnSuccess(result)
                await timeout(this.config.delay as number)
            } catch (error) {
                this.taskReport.numErrors++
                this.taskReport.errors.push(error)
                const shouldStop = this.config.shouldStopOnError ? await this.config.shouldStopOnError(error) : false
                if (shouldStop) {
                    break;
                }
            }

        }
        return this.taskReport
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

