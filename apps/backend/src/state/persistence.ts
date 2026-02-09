import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const STATE_FILE = path.join(DATA_DIR, "wallet.store.json")
const TMP_FILE = STATE_FILE + ".tmp"

export function loadState <T>(): T | null{
    try{
        if (!fs.existsSync(STATE_FILE)){
            return null
        }
        const raw = fs.readFileSync(STATE_FILE, "utf-8")
        return JSON.parse(raw)
    } catch {
        return null
    }

}