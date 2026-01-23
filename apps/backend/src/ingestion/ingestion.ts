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

function startIngestion () {

    // this function starts ingestions for wallet 
    // load ingestion state for wallet 
    // decide fresh start or resume
    // start WS subscription and RPC cursor (if needed)
    // set initial status (healthy / lagging)

}

function stopIngestion () {
    
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