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

function resumeIngestion () {

    //this function resumes the ingestion from a checkpoint
    // reads lastProcessedSlot and lastProcessedSignature 
    // decide how far behind we are 
    // if behind -- trigger RPC backfill
    // if caught up -- rely on WS

}

function handleWSEvent () {

    //this fucntion handles WS events
    // recieve unordered events 
    // normalize them into commom transaction stape
    // deduplicate 
    // detect gaps (slot jumps)
    // if gaps detected -- RPC backfill gets triggered 

}

function handleRPCBackfill () {

    //this function handles RPC backfill
    //fetch transactions from last checkpoint 
    // deduplicate vs the existing ones 
    // update ingestion cursor 
    // decide when WS can be trusted again 

}

// healthy -- heartbeat within n seconds
// lagging- no heartbeat but RPC is still processing
// failed- reported RPC failures or no progress for a long time
// stopped- explicitly stopped

const HEARTBEAT_THRESHOLD_MS = 15_000
const MAX_ERROR_COUNT = 3

function deriveIngestionState (state : IngestionState) : IngestionStatus {

    return "healthy"//dummy response for now just so TS doesnt show error
}