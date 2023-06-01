import { createDeferred } from "./deferred";
import { AutomatedTaskConfig, State, InternalAutomatedTaskConfig, TaskReport, CachePlugin, } from "./types";
import { timeout } from "./utils";



export default class AutomatedTask {

    private pausedDeferred = createDeferred()
    private cachePlugin?: CachePlugin
    private config!: InternalAutomatedTaskConfig
    private state: State


    constructor(config: AutomatedTaskConfig) {
        this.pausedDeferred.resolve()
        this.config = {
            delay: 0,
            numRepetitions: 1,
            ...config
        };
        this.state = this.getDefaultState()


    }

    private getDefaultState(): State {
        return {
            completedAt: null,
            isFirstRun: true,
            hasFinished: false,
            numErrors: 0,
            numSuccessfulRepetitions: 0,
            errors: [],
            results: [],
            startedAt: null,
            wasManuallyStopped: false
        }
    }

    private async setState(newState: Partial<State>) {
        this.state = { ...this.state, ...newState };
        if (this.cachePlugin) {
            await this.cachePlugin.setState(this.state)
        }
    }



    //take care of this in the context of cached restart
    private async handleScheduledStart() {
        const now = new Date()
        const startDate = this.config.startDate as Date

        const timeDifference = startDate.getTime() - new Date().getTime();

        if (timeDifference <= 0) {
            const error = new Error("Start date must be in the future.");
            //@ts-ignore
            error.code = "START_DATE_IN_PAST";
            throw error;
        }
        const delay = startDate.getTime() - now.getTime();
        if (delay > 0) {
            await timeout(delay);
        }
    }

    // This function will resolve with true if the task should continue, and false if it should stop
    private async executeIteration() {

        await this.pausedDeferred.promise
        if (this.state.wasManuallyStopped) {
            await this.setState({ hasFinished: true });
            return false;
        }

        const promiseFactory = this.config.taskFactory()

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
                    return false;
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
                this.setState({ wasManuallyStopped: true })
                return false;
            }
        }

        return true;
    }



    private async runLoop() {
        /**
         * This loop will run until the task is manually stopped, the number of repetitions is reached or any other stopping condition is met.
         */
        while (this.state.numSuccessfulRepetitions + this.state.numErrors < this.config.numRepetitions) {

            const shouldContinue = await this.executeIteration();
            if (!shouldContinue) {
                break;
            }
        }
    }

    /**
     * Start the procedure with a cache plugin present
     */
    private async startWithCaching() {

        var startingStateFromCache = await this.cachePlugin?.getState()
        if (startingStateFromCache?.isFirstRun) {
            if (this.config.startDate) {// Being that this is already a "new" task, we need to handle the scheduled start as usual.
                await this.handleScheduledStart()
            }
            await this.setState({ startedAt: new Date(), isFirstRun: false })
        } else {
            if (startingStateFromCache?.hasFinished) {
                if (this.config.startDate) {// Being that this is already a "new" task, we need to handle the scheduled start as usual.
                    await this.handleScheduledStart()
                }
                await this.setState({ ...this.getDefaultState(), startedAt: new Date(), isFirstRun: false })
            } else {
                await this.setState(startingStateFromCache as State);
            }
        }

        await this.runLoop()
    }

    /**
     * Start the procedure, without a cache plugin present
     */
    private async startWithoutCaching() {
        if (this.config.startDate) {
            await this.handleScheduledStart()
        }
        await this.setState({ startedAt: new Date() });
        await this.runLoop()
    }

    async start() {

        if (this.cachePlugin) {
            await this.startWithCaching()
        } else {
            await this.startWithoutCaching()
        }

        await this.setState({ hasFinished: true, completedAt: new Date() });

        const taskReport: TaskReport = {
            ...this.state,
        }

        return taskReport;
    }

    async stop() {
        await this.setState({ wasManuallyStopped: true });
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

    async registerCachePlugin(cache: CachePlugin) {
        this.cachePlugin = cache
    }
}


// (async()=>{
//     while(true){
//         await timeout(500)
//         console.log(Math.random())
//         await createFakePromise()
//     }
// })()



// function createFakePromise(){
//     return Promise.resolve()
// }