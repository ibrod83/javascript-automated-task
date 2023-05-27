import { State, CachePlugin } from "../src/types";
import fs from 'fs'
import util from 'util'
const writeFile = util.promisify(fs.writeFile)

export default class NodeFileCachePlugin implements CachePlugin {
    path: string
    constructor(path: string) {
        this.path = path
    }



    
    async getState() {

        //check if this.path exists
        if (!fs.existsSync(this.path)) {
            // writeFile(this.path, JSON.stringify({isFirstRun:true }), 'utf8')
            await this.setState({ isFirstRun: true })
        }

        const readFile = util.promisify(fs.readFile)
        const fileContents = await readFile(this.path, 'utf8')
        return JSON.parse(fileContents)
    }

    async setState(state: Partial<State>) {
        await writeFile(this.path, JSON.stringify(state), 'utf8')
    }    

}   