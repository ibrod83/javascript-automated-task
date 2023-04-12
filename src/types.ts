export type TaskFactory= () =>() => Promise<any> | any;

export interface AutomatedTaskConfig {
    shouldStopOnError?: (e: any) => boolean | Promise<boolean>
    shouldStopOnSuccess?: (result: any) => boolean |  Promise<boolean>
    onError?: (e: any) =>  Promise<void>| void 
    onSuccess?: (result: any) => void | Promise<void> 
    numRepetitions: number
    delay?: number
    taskFactory: TaskFactory    
}


export interface TaskReport{
    numErrors: number
    numSuccessfulRepetitions: number 
    results: any[],
    errors:any[]
}

// type MaybePromise<T> = T | Promise<T>;
