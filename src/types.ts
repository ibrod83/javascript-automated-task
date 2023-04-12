export type TaskFactory= () =>() => Promise<any> | any;

export interface AutomatedTaskConfig {
    shouldStopOnError?: ((e: any) => boolean) | ((e: any) => Promise<boolean>);
    shouldStopOnSuccess?: ((result: any) => boolean) | ((result: any) => Promise<boolean>);   
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
