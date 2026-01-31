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

    try {
        await stopIngestion(walletToBeRemoved.address)
    }catch(err){
        throw err
    }

    // remove wallet from store
    walletStore.delete(walletId)

    // mark ingestion state to stopped 
    ingestionStore.delete(walletId)

    // return boolean or remove wallet
    return true
}

// list the wallets (max is 100)
export const listWallets = async(userId : string) => {
    
    // filters wallets used by userId
    // for each wallet :
    // attach ingestion status
    // attach lastProcessedSlot
    // return array


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