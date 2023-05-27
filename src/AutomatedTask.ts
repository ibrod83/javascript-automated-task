import { createDeferred } from "./deferred";
import { AutomatedTaskConfig, State, InternalAutomatedTaskConfig, Schedule, TaskReport, CachePlugin, } from "./types";
import { timeout } from "./utils";



export default class AutomatedTask {

    private pausedDeferred = createDeferred()
    private cachePlugin?: CachePlugin
    config!: InternalAutomatedTaskConfig
    schedule?: Schedule
    state: State


    constructor(config: AutomatedTaskConfig) {
        this.pausedDeferred.resolve()
        this.config = {
            delay: 0,
            numRepetitions: 1,
            ...config
        };
        this.state = {
            isFirstRun: true,
            hasFinished: false,
            numErrors: 0,
            numSuccessfulRepetitions: 0,
            errors: [],
            results: [],
            startedAt: null,
            isStopped: false
        }


    }

    async setState(newState: Partial<State>) {
        this.state = { ...this.state, ...newState };
        if (this.cachePlugin) {
            await this.cachePlugin.setState(this.state)
        }
    }

    async registerCachePlugin(cache: CachePlugin) {
        this.cachePlugin = cache
    }

    private async handleStartDate(now:Date) {
        if (this.config.startDate) {
            const timeDifference = this.config.startDate.getTime() - new Date().getTime();

            if (timeDifference <= 0) {
                throw new Error("Start date must be in the future.");
            }
            const delay = this.config.startDate.getTime() - now.getTime();
            if (delay > 0) {
                await timeout(delay);
            }
        }
    } 

    private async handleCache(now:Date) {
        if (this.cachePlugin) {
            const state = await this.cachePlugin.getState()
            if(state.isFirstRun){
                await this.setState({ startedAt: now,isFirstRun:false });
            }else{
                await this.setState(state);
            }
        } else {
            await this.setState({ startedAt: now });
        }
    }

    async start() {
        const now = new Date()
        
        await this.handleCache(now)

        await this.handleStartDate(now)

        while (this.state.numSuccessfulRepetitions+this.state.numErrors < this.config.numRepetitions) {

            await this.pausedDeferred.promise
            if (this.state.isStopped) {
                await this.setState({ hasFinished: true });
                break;
            }

            const promiseFactory = this.config.taskFactory()//

            try {

                const result = await promiseFactory()

                await this.setState({
                    results: [...this.state.results, result],
                    numSuccessfulRepetitions: this.state.numSuccessfulRepetitions + 1,
                });

                this.config.onSuccess && await this.config.onSuccess(result)

                if (this.config.shouldStopOnSuccess) {
                    const shouldStop = await this.config.shouldStopOnSuccess(result)
                    if (shouldStop) {
                        this.state.hasFinished = true
                        break;
                    }
                }


                await timeout(this.config.delay)
            } catch (error) {
                await this.setState({
                    numErrors: this.state.numErrors + 1,
                    errors: [...this.state.errors, error],
                });
                this.config.onError && await this.config.onError(error)
                const shouldStop = this.config.shouldStopOnError ? await this.config.shouldStopOnError(error) : false
                if (shouldStop) {
                    this.state.hasFinished = true
                    break;
                }
            } 
        }

        await this.setState({ hasFinished: true });

        const taskReport: TaskReport = {
            ...this.state,
            startedAt: this.state.startedAt as Date,
            completedAt: new Date(),
        }
        return taskReport;
    }
    

    async stop() {
        await this.setState({ isStopped: true });
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

