import { AutomatedTaskConfig, TaskReport } from "./types";

export default class AutomatedTask {

    config!: AutomatedTaskConfig
    taskReport!: TaskReport
    private isStopped = false
    private isPaused = false;

    constructor(config: AutomatedTaskConfig) {
        this.config = config;
        this.taskReport = {
            numErrors: 0,
            numSuccessfulRepetitions: 0,
            results: []
        }
    }

    private async handlePause() {
        while (this.isPaused) {
            await timeout(100); // Introduce a small delay to avoid blocking the main thread
        }
    }

 

    async start() {

        for (let i = 0; i < this.config.numRepetitions; i++) {
            if (this.isStopped) {
                break;
            }

            await this.handlePause();
            const task = this.config.taskFactory()

            try {
                const result = await task()
                this.taskReport.results.push(result)
                this.taskReport.numSuccessfulRepetitions++
                this.config.shouldStopOnSuccess && await this.config.shouldStopOnSuccess(result)
                await timeout(this.config.delay)
            } catch (error) {
                this.taskReport.numErrors++
                // console.log('caught error ', error)//
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
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }
}


function timeout(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}



// (async()=>{
//     let counter=0
//     while(true){
//         counter++
//         console.log(counter)
//       await timeout(20)  
//     }
    
// })()