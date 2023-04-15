export type TaskFactory= () =>() => Promise<any> | any;

export interface AutomatedTaskConfig {
    shouldStopOnError?: (e: any) => boolean | Promise<boolean>
    shouldStopOnSuccess?: (result: any) => boolean |  Promise<boolean>
    onError?: (e: any) =>  Promise<void>| void 
    onSuccess?: (result: any) => void | Promise<void> 
    numRepetitions?: number
    delay?: number
    startDate?:Date
    taskFactory: TaskFactory    

}

export type InternalAutomatedTaskConfig = Required<Pick<AutomatedTaskConfig, 'delay' | 'numRepetitions'>> & Omit<AutomatedTaskConfig, 'delay' | 'numRepetitions'>;


export interface TaskReport{
    completedAt:Date,
    startedAt:Date,
    numErrors: number
    numSuccessfulRepetitions: number 
    results: any[],
    errors:any[]
}

export type InitialTaskReport = Partial<Pick<TaskReport, 'completedAt'>> & Required<Omit<TaskReport, 'completedAt'>>;


export interface Schedule{
    startDate: Date
    endDate?: Date
    repeat?: boolean
}



// type MaybePromise<T> = T | Promise<T>;
