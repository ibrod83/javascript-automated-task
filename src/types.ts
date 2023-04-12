export type TaskFactory= () =>() => Promise<any> | any;

export interface AutomatedTaskConfig {
    shouldStopOnError?: (e: any) => boolean | Promise<boolean>
    shouldStopOnSuccess?: (result: any) => boolean |  Promise<boolean>
    onError?: (e: any) =>  Promise<void>| void 
    onSuccess?: (result: any) => void | Promise<void> 
    numRepetitions: number
    delay?: number
    startDate?: Date
    taskFactory: TaskFactory    
}


export interface TaskReport{
    numErrors: number
    numSuccessfulRepetitions: number 
    results: any[],
    errors:any[]
}

export const CREATED = "created";
export const RUNNING = "running";
export const PAUSED = "paused";
export const FINISHED = "finished";

export type TaskState = typeof CREATED | typeof RUNNING | typeof PAUSED | typeof FINISHED;

// type MaybePromise<T> = T | Promise<T>;
