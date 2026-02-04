// initialize logic
// status transitions
// heartbeat updates

import { deriveIngestionState, } from "./ingestion"
import { getIngestionState, setIngestionState, walletStore } from "../state/wallet.store"
import { markLagging, markCaughtUp, markError } from "./ingestion"

export function startIngestionHealthSweeper(intervalMS = 5_000){

    setInterval(() => {
        for (const wallet of walletStore.values()){
            const state = getIngestionState(wallet.id)

            // we basically ingore these states
            if (state.status === "stopped" || state.status === "failed"){
                continue
            }
        }

        
    })
}