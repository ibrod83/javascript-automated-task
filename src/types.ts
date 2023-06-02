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


// export interface TaskReport extends Omit<State, 'wasManuallyStopped' |'isFirstRun'> {
//     startedAt: Date
// }

export interface TaskReport extends State {}

export type State = {
    isFirstRun: boolean
    hasFinished: boolean
    wasManuallyStopped: boolean
    numErrors: number
    numSuccessfulRepetitions: number
    results: any[]
    errors: any[]
    startedAt: Date | null
    completedAt: Date | null
}





export interface PersistencePlugin {
    getState: () => Promise<State>
    setState: (state: State) => Promise<void>
}



// type MaybePromise<T> = T | Promise<T>;
