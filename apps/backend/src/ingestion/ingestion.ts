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

import { StatementSync } from "node:sqlite"
import { IngestionState, IngestionStatus } from "../models"
import { date } from "zod"

const HEARTBEAT_THRESHOLD_MS = 15_000
const MAX_ERROR_COUNT = 3

// function to create an initial ingestion state
export function createInitialIngestionState (walletId : string, walletAddress: string): IngestionState {
  return {
    walletId,
    walletAddress,
    status: "starting",
    
    lastProcessedSlot : 0,
    lastProcessedSignature: "",
    
    wsConnected : false,
    rpcBackFillInProgress: false,
    
    updatedAt: new Date(),
    lastHeartbeatAt: null,
    errorCount: 0
  }
  
}

//defining transitionss

export function markWsconnected(state: IngestionState): IngestionState {
  return {
    ...state,
    wsConnected: true,
    lastHeartbeatAt: Date.now(),
    status: "healthy",
    updatedAt: new Date()
  }
}

export const startIngestion = async(address: string) => {
  
  // this function starts ingestions for wallet 
  // load ingestion state for wallet 
  // decide fresh start or resume
  // start WS subscription and RPC cursor (if needed)
  // set initial status (healthy / lagging)
  
}

export const stopIngestion = async(address : string) => {
  
  // this function stops the ingestion
  //unsubs the WS
  // flush any buffered transactions
  // persist any ingestion 
  // mark ingestion as stopped
  
}

// function resumeIngestion () {
  
//   //this function resumes the ingestion from a checkpoint
//   // reads lastProcessedSlot and lastProcessedSignature 
//   // decide how far behind we are 
//   // if behind -- trigger RPC backfill
//   // if caught up -- rely on WS
  
// }

// function handleWSEvent () {
  
//   //this fucntion handles WS events
//   // recieve unordered events 
//   // normalize them into commom transaction stape
//   // deduplicate 
//   // detect gaps (slot jumps)
//   // if gaps detected -- RPC backfill gets triggered 
  
// }

// function handleRPCBackfill () {
  
//   //this function handles RPC backfill
//   //fetch transactions from last checkpoint 
//   // deduplicate vs the existing ones 
//   // update ingestion cursor 
//   // decide when WS can be trusted again 
  
// }

// healthy -- heartbeat within n seconds
// lagging- no heartbeat but RPC is still processing
// failed- reported RPC failures or no progress for a long time
// stopped- explicitly stopped

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