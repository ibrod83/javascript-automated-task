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
            const task = this.config.factory()

            try {
                const result = await task()
                this.taskReport.results.push(result)
                this.taskReport.numSuccessfulRepetitions++
                this.config.onSuccessfulRepetition && await this.config.onSuccessfulRepetition(result)
            } catch (error) {
                this.taskReport.numErrors++
                // console.log('caught error ', error)
                const shouldStop = this.config.onError ?  await this.config.onError(error) : false
                if(shouldStop){
                    break;
                }
               
            }
            // await setTimeout(500)
            

        }
        return this.taskReport
        // console.log('numErrors', numErrors)
    }
}
