// a place that stores wallets (keyed by walletId)
// a place that stores ingestionState (keyed by walletId)
import type { Wallet } from "../models"
import { startIngestion, stopIngestion } from "../ingestion/ingestion"
import { PublicKey } from "@solana/web3.js"

// addWallet(userId, address)
// removeWallet(walletId)
// listWallets(userId)
// countWallets(userId)

// this adds the wallets to the wallet list (max is 100 wallets)

type IngestionState = {
    ingestionStatus : "healthy" | "lagging" | "failed" | "stopped"
    lastProcessedSignature : string | null
    lastProcessedSlot : number
}
const ingestionStore = new Map <string, IngestionState>()

const walletStore = new Map <string, Wallet>()

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
    
    //store it in the wallet state
    walletStore.set(walletId, wallet)

    // initialize ingestionState (
    // status : "healthy"
    //lastProcessedSlot = 0
    // lastProcessedSignature = "null") 

    ingestionStore.set (walletId, {
        ingestionStatus : "healthy",
        lastProcessedSlot : 0,
        lastProcessedSignature : null
    })

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
export const removeWallet = async(walletId : string) => {
    //find wallet 
    const walletToBeRemoved = walletStore.get(walletId)

    // if not found , throw error
    if (!walletToBeRemoved){
        throw new Error ("wallet not found")
    }
    await stopIngestion(walletToBeRemoved.address)
    
    // mark ingestion state to stopped 
    const prev = ingestionStore.get(walletId)
    if (!prev) {
        throw new Error("ingestion state not found")
    }

    ingestionStore.set(walletId, {
        ingestionStatus: "stopped",
        lastProcessedSlot: prev.lastProcessedSlot,
        lastProcessedSignature: prev.lastProcessedSignature
    })

    // return boolean or remove wallet
    return true
}

// list the wallets (max is 100)
export const listWallets = async(userId : string) => {
    // filters wallets used by userId
    const userWallets = []
    
    // for each wallet :
    for (const [walletId, wallet] of walletStore.entries()){
        if (wallet.userId !== userId) 
            continue
        
        // attach ingestion status
        const ingestion = ingestionStore.get(walletId)
        if (!ingestion) {
            throw new Error (`ingetsion state missing for wallet ${walletId}`)
        }
       
        // attach lastProcessedSlot
        userWallets.push ({
            walletId : wallet.id,
            address : wallet.address,
            ingestionStatus : ingestion.ingestionStatus,
            lastProcessedSlot : ingestion.lastProcessedSlot,
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