export type TaskFactory = () => () => Promise<any> | any;

export interface AutomatedTaskConfig {
    shouldStopOnError?: (e: any) => boolean | Promise<boolean>
    shouldStopOnSuccess?: (result: any) => boolean | Promise<boolean>
    onError?: (e: any) => Promise<void> | void
    onSuccess?: (result: any) => void | Promise<void>
    numRepetitions?: number
    delay?: number
    startDate?: Date
    taskFactory: TaskFactory

}

export type InternalAutomatedTaskConfig = Required<Pick<AutomatedTaskConfig, 'delay' | 'numRepetitions'>> & Omit<AutomatedTaskConfig, 'delay' | 'numRepetitions'>;


export interface TaskReport extends Omit<State, 'isStopped' |'isFirstRun'> {
    completedAt: Date
    startedAt: Date
}


export type State = {
    isFirstRun: boolean
    hasFinished: boolean
    isStopped: boolean
    numErrors: number
    numSuccessfulRepetitions: number
    results: any[]
    errors: any[]
    startedAt: Date | null
}


export interface Schedule {
    startDate: Date
    endDate?: Date
    repeat?: boolean
}

export interface CachePlugin {
    getState: () => Promise<{isFirstRun:boolean}>
    setState: (state: State) => Promise<void>
}



// type MaybePromise<T> = T | Promise<T>;
