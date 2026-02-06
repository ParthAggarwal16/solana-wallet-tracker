// initialize logic
// status transitions
// heartbeat updates

import { deriveIngestionState, markStopped, stopIngestion } from "./ingestion"
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

export function stopHeartbeat (walletId : string) {
    const timer = heartbeatTimers.get(walletId)
    if (!timer) {return}

    clearInterval(timer)
    heartbeatTimers.delete(walletId)
    
}

const RECONCLIE_INTERVAL_MS = 10_000

let reconcileTimer : NodeJS.Timeout | null = null

export function reconcileWallet (walletId : string){
    const state = getIngestionState(walletId)

    const derived = deriveIngestionState({
        status : state.status,
        lastHeartbeatAt : state.lastHeartbeatAt,
        lastProcessedSlot : state.lastProcessedSlot,
        errorCount : state.errorCount
    })

    //if failed then hard stoppped
    if (derived === "failed" && state.status !== "failed"){
        setIngestionState(walletId, markStopped(state))
        stopIngestion(state.walletAddress)
    }

    // if lagging then ensure RPC backfill 
    if (derived === "lagging" && state.status !== "lagging"){
        setIngestionState(walletId, markLagging(state))
            //RPC bacfill will be triggered by work logic later
            triggerRPCBackfill(walletId)
        return 
    }

    // if healthy then WS only, no backfill
    if (derived === "healthy" && state.status === "lagging"){
        setIngestionState(walletId, markCaughtUp(state))
    }
}

export function startReconciler(){
    if (reconcileTimer){return}

    reconcileTimer = setInterval(() => {
        for (const walletId of walletStore.keys()){
            reconcileWallet(walletId)
        }
    }, RECONCLIE_INTERVAL_MS);

}

// this function triggers RPC backfill
export async function triggerRPCBackfill(walletId : string){
    const state = getIngestionState(walletId)

    // gaurd alredy backfilling
    if (state.rpcBackFillInProgress){return}

    setIngestionState(walletId, {
        ...state,
        rpcBackFillInProgress : true,
        updatedAt : new Date()
    })

    try {
        await runRPCBackfill(walletId)
    }catch(err){
        const errored = markError(getIngestionState(walletId))
        setIngestionState(walletId, errored)
    }
}

//this function runs RPC backfill
export async function runRPCBackfill (walletId : string){
    let state = getIngestionState(walletId)

    while (true){
        if (state.status === "stopped") return
        if (state.errorCount >= 3) return

        //placeholer : fetch conditions after 
        //{ lastprocessedSlot, lastprocessedSignatuer}
        //const txs = await fecthfromRPC

        const txs : Array<{
            slot : number
            signature : string
        }> =[]

        if (txs.length === 0){
            //caugth up
            const caughtUp = markCaughtUp(state)
            setIngestionState(walletId, caughtUp)
            return 
        }

        //update cursor using last tx
        const last = txs[txs.length- 1]
        
        if (!last) {return} //did this because typescript wont shut up

        setIngestionState(walletId, {
            ...state,
            lastProcessedSlot: last.slot,
            lastProcessedSignature: last.signature,
            updatedAt: new Date()
        })
        state = getIngestionState(walletId)
    }
}

type WSTransaction = {
    slot : number,
    signature : string
}

// Get wallet unordered buffer
const wsBuffer: Map<string, WSTransaction[]> = new Map()
// Per wallet dedupe set (fixed type)
const wsSeen: Map<string, Set<string>> = new Map()

// Constants for buffer management
const MAX_BUFFER_SIZE = 1000
const MAX_SEEN_SIZE = 5000

export function handleWSTransaction(
  walletId: string,
  tx: WSTransaction
) {
  const state = getIngestionState(walletId)
  if (state.status === "stopped" || state.status === "failed") {
    return
  }
  
  // Heartbeat on any WS activity
  setIngestionState(walletId, markHeartbeat(state))
  
  // Ignore old data
  if (tx.slot <= state.lastProcessedSlot) {
    return
  }
  
  bufferTransaction(walletId, tx)
  flushBuffer(walletId)
}

export function bufferTransaction(walletId: string, tx: WSTransaction): void {
  let buffer = wsBuffer.get(walletId)
  if (!buffer) {
    buffer = []
    wsBuffer.set(walletId, buffer)
  }
  
  let seen = wsSeen.get(walletId)
  if (!seen) {
    seen = new Set<string>()
    wsSeen.set(walletId, seen)
  }
  
  const key = `${tx.slot}:${tx.signature}`
  if (seen.has(key)) return
  
  seen.add(key)
  buffer.push(tx)
  
  // Prevent unbounded growth
  if (buffer.length > MAX_BUFFER_SIZE) {
    buffer.shift() // Remove oldest
  }
  
  // Clean up seen set if it gets too large
  if (seen.size > MAX_SEEN_SIZE) {
    const sortedBuffer = [...buffer].sort((a, b) => a.slot - b.slot)
    const minSlot = sortedBuffer[0]?.slot ?? tx.slot
    
    // Remove entries for slots we've moved past
    for (const seenKey of seen) {
      const slotStr = seenKey.split(':')[0]
      if (slotStr) {  // Check if defined
        const slot = parseInt(slotStr, 10)
        if (!isNaN(slot) && slot < minSlot - 100) { // Keep some history
          seen.delete(seenKey)
        }
      }
    }
  }
}

export function flushBuffer(walletId: string): void {
  const buffer = wsBuffer.get(walletId)
  if (!buffer || buffer.length === 0) return
  
  buffer.sort((a, b) => a.slot - b.slot)
  
  let state = getIngestionState(walletId)
  let cursor = state.lastProcessedSlot
  let consumed = 0
  
  for (const tx of buffer) {
    if (tx.slot === cursor + 1) {
      cursor = tx.slot
      state = {
        ...state,
        lastProcessedSlot: tx.slot,
        lastProcessedSignature: tx.signature,
        updatedAt: new Date()
      }
      setIngestionState(walletId, state)
      consumed++
    } else {
      break
    }
  }
  
  buffer.splice(0, consumed)
  
  // Check if there's a gap after consuming transactions
  const nextTx = buffer[0]
  if (nextTx && nextTx.slot > cursor + 1) {
    setIngestionState(walletId, markLagging(state))
    triggerRPCBackfill(walletId)
  }
}