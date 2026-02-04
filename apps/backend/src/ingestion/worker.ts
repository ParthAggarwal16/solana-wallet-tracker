// initialize logic
// status transitions
// heartbeat updates

import { deriveIngestionState } from "./ingestion"
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

            const derived = deriveIngestionState({
                status : state.status,
                lastHeartbeatAt: state.lastHeartbeatAt,
                lastProcessedSlot: state.lastProcessedSlot,
                errorCount : state.errorCount
            })

            // state transitions
            if (derived === "lagging" && state.status === "healthy"){
                setIngestionState(wallet.id, markLagging(state))
            }

             if (derived === "healthy" && state.status === "lagging"){
                setIngestionState(wallet.id, markCaughtUp(state))
            }

            if (derived === "failed"){
                setIngestionState(wallet.id, markError(state))
            }

        }

        
    }, intervalMS)
}