// initialize logic
// status transitions
// heartbeat updates

import { deriveIngestionState, stopIngestion } from "./ingestion"
import { getIngestionState, setIngestionState, walletStore } from "../state/wallet.store"
import { markLagging, markCaughtUp, markError, markHeartbeat } from "./ingestion"

const HEARTBEAT_INTERVAL_MS = 5_000

const heartbeatTimers = new Map<string, NodeJS.Timeout>()

export function startHeartbeat (walletId : string){

    if (heartbeatTimers.has(walletId)) {return}    

    const timer = setInterval(() => {
        const state = getIngestionState(walletId)

        if (state.status === "stopped" || state.status === "failed"){
            stopIngestion(walletId)
            return
        }
        setIngestionState(walletId, markHeartbeat(state))
    }, HEARTBEAT_INTERVAL_MS )
    heartbeatTimers.set(walletId, timer)
}

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