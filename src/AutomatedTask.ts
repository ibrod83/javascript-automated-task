import { AutomatedTaskConfig,   TaskReport } from "./types";

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
            results: []//
        }
    }

    private async handlePause() {
        while (this.isPaused) {
            if(this.isStopped){
                break;
            }
            await timeout(50); // Introduce a small delay to avoid blocking the main thread
        }
    }

    // private async *taskGenerator(){//
    //     while(true){
    //         await timeout(10)
    //         const promiseFactory = this.config.taskFactory()//
    //         yield promiseFactory
    //     }
    // }    
 

    async start() {
        // const generator = this.taskGenerator()

        for (let i = 0; i < this.config.numRepetitions; i++) {
            if(this.isPaused){
                await this.handlePause()
            }
            if (this.isStopped) {
                // generator.return()
                break;
            }

            const promiseFactory = this.config.taskFactory()//
            

            try {
                // const next =await generator.next()
                // const task = next.value as (() => Promise<any>)
               
                // const result = await task()
                const result = await promiseFactory()

                this.taskReport.results.push(result)//
                this.taskReport.numSuccessfulRepetitions++
                this.config.shouldStopOnSuccess && await this.config.shouldStopOnSuccess(result)
                await timeout(this.config.delay)
            } catch (error) {
                this.taskReport.numErrors++
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


function timeout(milliseconds: number) {//
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