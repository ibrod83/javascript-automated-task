export interface TaskFactory {
    (): () => Promise<any>;
}

export interface AutomatedTaskConfig {
    shouldStopOnError?: (e: any)=>boolean
    shouldStopOnSuccess?: (result: any)=>boolean     
    numRepetitions: number
    delay: number
    taskFactory: TaskFactory    
}

export interface TaskReport{
    numErrors: number
    numSuccessfulRepetitions: number 
    results: any[]   
}


