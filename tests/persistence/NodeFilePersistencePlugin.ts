import { State, PersistencePlugin } from "../../src/types";
import fs from 'fs'
import util from 'util'
const writeFile = util.promisify(fs.writeFile)

export default class NodeFilePersistencePlugin implements PersistencePlugin {
    path: string
    constructor(path: string) {
        this.path = path
    }
     
    async getState() {

        //check if this.path exists
        if (!fs.existsSync(this.path)) {
            // writeFile(this.path, JSON.stringify({isFirstRun:true }), 'utf8')
            const state: Partial<State> = {
                isFirstRun: true,
            }
            await this.setState(state as State) 
        }

        const readFile = util.promisify(fs.readFile)
        const fileContents = await readFile(this.path, 'utf8')
        return JSON.parse(fileContents) as State
    }

    async setState(state: State) {
       
        await writeFile(this.path, JSON.stringify(state), 'utf8')
    }    

}   