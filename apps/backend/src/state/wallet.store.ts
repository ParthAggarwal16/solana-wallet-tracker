// a place that stores wallets (keyed by walletId)
// a place that stores ingestionState (keyed by walletId)
import type { Wallet, IngestionState, IngestionStatus } from "../models"
import { deriveIngestionState, startIngestion, stopIngestion, createInitialIngestionState, markStopped } from "../ingestion/ingestion"
import { PublicKey } from "@solana/web3.js"

// addWallet(userId, address)
// removeWallet(walletId)
// listWallets(userId)
// countWallets(userId)

// this adds the wallets to the wallet list (max is 100 wallets)

export const ingestionStore = new Map <string, IngestionState>()

export const walletStore = new Map <string, Wallet>()

export function getIngestionState(walletId: string): IngestionState {
    const state = ingestionStore.get(walletId)
    if (!state){
        throw new Error (`ingestion state is missing for wallet ${walletId}`)
    }
    return state
}

export function setIngestionState (walletId : string, nextState: IngestionState) {
    ingestionStore.set(walletId, nextState)
}

export const addWallet = async(userId : string , address : string) => {
    
    //solana address check
    if (!isValidSolanaAddress(address)){
        throw new Error("invalid solana address")
    }
    
    const count = await countWallets(userId)
    if (count >= 100) {
        throw new Error("wallet limit exeeded (max100)")
    }

    // prevent duplicate wallet tracking
    for (const wallet of walletStore.values()){
        if (wallet.userId === userId && wallet.address === address){
            throw new Error ("wallet already tracked")
        }
    
    }

    //generate walletId
    const walletId = crypto.randomUUID()
    
    // chain = solana
    // createdAt = now
    const wallet: Wallet = {
        id : walletId,
        userId : userId,
        address : address,
        chain : "solana",
        createdAt : new Date ()
    }

    //calling the initial ingestion state in addwallets
    const ingestionState = createInitialIngestionState(walletId, address)
    ingestionStore.set(walletId, ingestionState)
    
    //store it in the wallet state
    walletStore.set(walletId, wallet)

    // initialize ingestionState (
    // status : "healthy"
    //lastProcessedSlot = 0
    // lastProcessedSignature = "null") 

    try {
        await startIngestion(address)
    } catch (err) {
        walletStore.delete(walletId)
        ingestionStore.delete(walletId)
        throw err
    }

    return {walletId: wallet.id,
        address : wallet.address,
        chain : wallet.chain,
        ingestionStatus : "healthy"
    }

}

// removes the wallet from the list
export const removeWallet = async(userId : string, walletId : string) => {
    //find wallet 
    const walletToBeRemoved = walletStore.get(walletId)

    // if not found , throw error
    if (!walletToBeRemoved){
        throw new Error ("wallet not found")
    }

    if (walletToBeRemoved.userId !== userId){
        throw new Error ("wallet does not belong to the user")
    }

    await stopIngestion(walletToBeRemoved.address)
    
    // mark ingestion state to stopped 
    const ingestion = getIngestionState(walletId)
    if (!ingestion) {
        throw new Error("ingestion state not found")
    }

    setIngestionState(walletId, markStopped(ingestion))

    walletStore.delete(walletId)
    ingestionStore.delete(walletId)

    // return boolean or remove wallet
    return true
}

// list the wallets (max is 100)
export const listWallets = async(userId : string) => {
    // filters wallets used by userId
    const userWallets: Array <{
        walletId : string,
        address : string,
        chain : "solana",
        ingestionStatus : "healthy" | "lagging" | "failed" | "stopped" | "starting"
        lastProcessedSlot : number
    }> = []
    
    // for each wallet :
    for (const [walletId, wallet] of walletStore.entries()){
        if (wallet.userId !== userId) 
            continue
        
        // attach ingestion status
        const ingestion = getIngestionState(walletId)
        if (!ingestion) {
            throw new Error (`ingestion state missing for wallet ${walletId}`)
        }
        
        const derivedStatus = deriveIngestionState({
            status: ingestion.status,
            lastProcessedSlot: ingestion.lastProcessedSlot,
            lastHeartbeatAt: ingestion.lastHeartbeatAt,
            errorCount: ingestion.errorCount,
            rpcBackFillInProgress: ingestion.rpcBackFillInProgress
        })
        // attach lastProcessedSlot
        userWallets.push ({
            walletId : wallet.id,
            address : wallet.address,
            lastProcessedSlot : ingestion.lastProcessedSlot,
            chain : wallet.chain,
            ingestionStatus : derivedStatus
        })
        
    }
    // return array
    return userWallets
}

// this counts the wallets to ensure the wallets dont scross 100
export const countWallets = async(userId : string): Promise<number> => {
    // return number of wallets of that user 
    // no side effects

        let count = 0 
    for (const wallet of walletStore.values()) {
        if (wallet.userId === userId){
            count ++
        }
    }
    return count 
}

function isValidSolanaAddress (address : string) {
    try{
        new PublicKey(address)
        return true
    }
    catch {
        return false
    }

}