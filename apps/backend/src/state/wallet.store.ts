// a place that stores wallets (keyed by walletId)
// a place that stores ingestionState (keyed by walletId)
import type { Wallet } from "../models"
import { startIngestion } from "../ingestion/ingestion"

// addWallet(userId, address)
// removeWallet(walletId)
// listWallets(userId)
// countWallets(userId)

// this adds the wallets to the wallet list (max is 100 wallets)

type IngestionState = {
    ingestionStatus : "healthy" | "lagging" | "failed" 
    lastProcessedSignature : string | null
    lastProcessedSlot : number
}
const ingestionStore = new Map <string, IngestionState>()

const walletStore = new Map <string, Wallet>()

export const addWallet = async(userId : string , address : string) => {
    const count = await countWallets(userId)
    if (count >= 100) {
        throw new Error("wallet limit exeeded (max100)")
    }

    // prevent duplicate wallet tracking
    for (const wallet of walletStore.values()){
        if (wallet.userId === userId && wallet.address === address){
            throw new Error ("wallet already tracked")
        }
    
    return 0
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

    await startIngestion(address)

    return {walletId: wallet.id,
        address : wallet.address,
        chain : wallet.chain,
        ingestionStatus : "healthy"
    }

}

// removes the wallet from the list
export const removeWallet = async(walletId : string) => {

    //find wallet 
    // if not found , throw error
    // remove wallet from store
    // mark ingestion state to stopped 
    // return boolean or remove wallet

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


    return 0
}

