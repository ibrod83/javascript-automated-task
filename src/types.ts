export interface TaskFactory {
    (): () => Promise<any>;
}

export interface AutomatedTaskConfig {
    onError?: (e: any)=>boolean
    onSuccessfulRepetition?: (result: any)=>boolean
    numRepetitions: number
    delay: number
    factory: TaskFactory    
}

export interface TaskReport{
    numErrors: number
    numSuccessfulRepetitions: number 
    results: any[]   
}

