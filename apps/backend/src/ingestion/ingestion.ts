// transaction state  are ordered by slot 
// {walletAddress, signature} is unique
// a tranaction is immuatble once started 
// ingestion resumes from lastProcessedSlot and lastProcessedSignature(this acts as a decider
                                                                //      in case of smae slot)
// WS data can be out of order 
// RPC is the source of truth of recovery
// healthy = receiving WS data
// lagging = WS missed data, RPC catching up
// failed = RPC unavailable / repeated errors

import { IngestionState, IngestionStatus } from "../models"
import { getIngestionState, setIngestionState, ingestionStore } from "../state/wallet.store"

const HEARTBEAT_THRESHOLD_MS = 15_000
const MAX_ERROR_COUNT = 3

const heartBeatRegistry = new Map<string, NodeJS.Timeout>()

// function to create an initial ingestion state
export function createInitialIngestionState (walletId : string, walletAddress: string): IngestionState {
  return {
    walletId,
    walletAddress,
    status: "starting",
    
    lastProcessedSlot : 0,
    lastProcessedSignature: null,
    
    wsConnected : false,
    rpcBackFillInProgress: false,
    
    updatedAt: new Date(),
    lastHeartbeatAt: null,
    errorCount: 0
  }
  
}

//defining transitionss

export function markWsConnected(state: IngestionState): IngestionState {
  return {
    ...state,
    wsConnected: true,
    lastHeartbeatAt: Date.now(),
    status: "healthy",
    updatedAt: new Date()
  }
}

export function markHeartbeat (state: IngestionState): IngestionState{
  return {
    ...state,
    lastHeartbeatAt: Date.now(),
    updatedAt: new Date()
  }
}

export function markLagging (state: IngestionState): IngestionState {
  return {
    ...state,
    status: "lagging",
    rpcBackFillInProgress: true,
    updatedAt: new Date()
  }
}

export function markCaughtUp (state: IngestionState): IngestionState {
  return {
    ...state,
    status: "healthy",
    rpcBackFillInProgress: false,
    updatedAt: new Date()
  }
}

export function markError (state: IngestionState): IngestionState {
  const errorCount = state.errorCount + 1
  return {
    ...state,
    errorCount,
    status : errorCount > MAX_ERROR_COUNT ? "failed" : state.status,
    updatedAt: new Date()
  }

}

export function markStopped (state: IngestionState): IngestionState {
  return {
    ...state,
    status: "stopped",
    wsConnected: false,
    rpcBackFillInProgress : false,
    updatedAt: new Date()
  }
}

export const startIngestion = async(address: string) => {

  //find ingestion state by address
  let targetWalletId : string | null = null

  for (const [walletId, state] of ingestionStore.entries()){
    if (state.walletAddress === address){
      targetWalletId = walletId
      break
    }
  }

  //by doing this , we are also forcing targetwalletId to have some value without giving it one explicitly
  if (!targetWalletId){
    throw new Error (`no ingestion state for the address ${address}`)
  }

  const current = getIngestionState(targetWalletId)

  //mark ingestionState as healthy and ws connected
  setIngestionState(targetWalletId, markWsConnected(current))

  //prevent double start
  if (heartBeatRegistry.has(address)){
    return
  }

  //defining interval between ingestion states
  const interval = setInterval(() => {
    const state = getIngestionState(targetWalletId)
    if (state.status === "stopped")
      return

    setIngestionState(targetWalletId, 
      markHeartbeat(state))
  }, 5_000);

  heartBeatRegistry.set(address, interval)
}

export const stopIngestion = async(address : string) => {
  
  // this function stops the ingestion
  //unsubs the WS
  // flush any buffered transactions
  // persist any ingestion 
  // mark ingestion as stopped
  
}

export function deriveIngestionState(
  input: IngestionDerivationInput
): IngestionStatus {
  if (input.status === "stopped") 
    return "stopped"

  if (input.errorCount > 3) 
    return "failed"

  if (input.lastHeartbeatAt !== null && Date.now() - input.lastHeartbeatAt > 30_000) {
    return "lagging"
  }

  return "healthy"
}

export type IngestionDerivationInput = {
  status: IngestionStatus
  lastProcessedSlot: number
  lastHeartbeatAt: number | null
  errorCount: number
}