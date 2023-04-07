import { AutomatedTaskConfig, TaskReport } from "./types";

export default class AutomatedTask {

    config!: AutomatedTaskConfig
    taskReport!: TaskReport

    constructor(config: AutomatedTaskConfig) {
        this.config = config;
        this.taskReport = {
            numErrors: 0,
            numSuccessfulRepetitions: 0,
            results: []
        }
    }

    async start() {

        for (let i = 0; i < this.config.numRepetitions; i++) {
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
                const shouldStop = this.config.shouldStopOnError ?  await this.config.shouldStopOnError(error) : false
                if(shouldStop){
                    break;
                }
               
            }           

        }
        return this.taskReport
    }
}


function timeout(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}