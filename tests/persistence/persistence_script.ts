import path from "path";
import AutomatedTask from "../../src/AutomatedTask";
import NodeFilePersistencePlugin from "./NodeFilePersistencePlugin";

function taskFactory() {

    return async () => {
        return Math.random()
    }
}

(async () => {

    let counter = 0
    const config = {
        delay: 50,
        numRepetitions: 20,
        taskFactory: taskFactory,
        onSuccess(r:any){
            counter++
            console.log(counter)
        },

    }
 
    const persistence = new NodeFilePersistencePlugin(path.join(__dirname, 'test.json'));
    

    const task = new AutomatedTask(config);

    task.registerPersistencePlugin(persistence)

    const report = await task.start()
    console.log('DONE')
})()


