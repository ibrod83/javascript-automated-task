import AutomatedTask from "./AutomatedTask";
// console.log(this)
function taskFactory() {
    return async() => {
        const rndInt = Math.floor(Math.random() * 5) + 1

        if (rndInt == 1) {
            throw new Error('error from task')
        }
        

        const r = Math.random();
        // console.log(r)
        return r
    }
}

(async ()=>{
    const task = new AutomatedTask({
        delay:1000,
        numRepetitions:10,
        factory:taskFactory,
        onError(e) {
            console.log('error from hook',e.message)
            return true
        },
        onSuccessfulRepetition(...args) {
            console.log(args[0])
            return false
        },
    });
    const results = await task.start()
    console.log(results)
})()