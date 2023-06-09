import { expect } from 'expect';
import spawn from 'cross-spawn';
import kill from 'tree-kill';
import fs from 'fs';
import { ChildProcess } from 'child_process';
import { AutomatedTask } from '../../src';
import NodeFilePersistencePlugin from './NodeFilePersistencePlugin';
import path from 'path';
import { getDateInTheFuture } from './utils';

const jsonPath = './tests/persistence/test.json';
const scriptPath = './tests/persistence/persistence_script.ts';
describe('Persistence', function () {

    this.beforeEach(() => {
        if (fs.existsSync(jsonPath)) {
            fs.unlinkSync(jsonPath);
        }
    });

    it('Should resume from persisted state, then perform again the entire task from clean state', async function () {

        await new Promise(resolve => setTimeout(resolve, 50));

        // Condition function that returns true after 10 messages
        const conditionFn1 = (_, counter) => counter === 10;
        const firstProcess = await createProcess(scriptPath, conditionFn1);
        kill(firstProcess.pid as number);

        var persistedState = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        expect(persistedState.results.length).toEqual(10);
        // Condition function that returns true when 'DONE' appears in the output
        const conditionFn2 = (data: any) => data.includes('DONE');
        const secondProcess = await createProcess(scriptPath, conditionFn2);
        kill(secondProcess.pid as number);

        persistedState = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        expect(persistedState.results.length).toEqual(20);
        const completedAtAfterPersistedUsage = persistedState.completedAt;

        //IMPORTANT: the third process should not be able to use the persistence, according to the current implementation
        const thirdProcess = await createProcess(scriptPath, conditionFn2);
        kill(thirdProcess.pid as number);
        persistedState = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        expect(persistedState.results.length).toEqual(20);
        expect(new Date(persistedState.completedAt).getTime()).toBeGreaterThan(new Date(completedAtAfterPersistedUsage).getTime());

    });

    it('Should not start a task if the startDate has already passed, after the initial task was completed', async function () {


        const futureDate = getDateInTheFuture(1);

        await new Promise(resolve => setTimeout(resolve, 50));


        const task1 = await createTaskWithPlugin({ startDate: futureDate, taskFactory });
        await task1.start();

        try {
            const task2 = await createTaskWithPlugin({ startDate: new Date(), taskFactory });
            await task2.start(); // Add await here if start() is an async function    // 
        } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.code).toEqual('START_DATE_IN_PAST');
        }
    });

    it("Should resume a task even if the startDate has already passed, if the task wasn't completed in the first run", async function () {
        await new Promise(resolve => setTimeout(resolve, 50));

        
        const conditionFn1 = (_, counter) => counter === 5;
        const firstProcess = await createProcess('./tests/persistence/persistence_script_startDate.ts', conditionFn1);
        kill(firstProcess.pid as number);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const conditionFn2 = (data: any) => data.includes('DONE');
        const secondProcess = await createProcess('./tests/persistence/persistence_script_startDate.ts', conditionFn2);
        kill(secondProcess.pid as number);

        const persistedState = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        expect(persistedState.results.length).toEqual(30);
        expect(persistedState.hasFinished).toBe(true);//
        
    });
});


const createProcess = async (scriptPath, condition) => {
    // spawn a child process using ts-node
    const process = spawn('./node_modules/.bin/ts-node', [scriptPath]);

    return new Promise<ChildProcess>((resolve, reject) => {
        let counter = 0;
        process.stdout?.on('data', (data) => {
            counter++;
            console.log(`stdout: ${data}`);
            if (condition(data.toString(), counter)) {
                resolve(process);
            }
        });

        process.stderr?.on('data', (data) => {
            console.error(`stderr: ${data}`);
            reject(data);
        });

        process.on('exit', (code, signal) => {
            console.log(`child process exited with code ${code} and signal ${signal}`);
        });
    });
}

const createTaskWithPlugin = async ({ startDate, taskFactory }) => {
    const config = {
        delay: 110,
        numRepetitions: 10,
        startDate,
        taskFactory,
    }

    const persistence = new NodeFilePersistencePlugin(path.join(__dirname, 'test.json'));

    const task = new AutomatedTask(config);

    task.registerPersistencePlugin(persistence)
    return task;
}

function taskFactory() {

    return async () => {
        return Math.random()
    }
}
