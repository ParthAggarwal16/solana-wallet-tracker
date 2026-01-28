// a place that stores wallets (keyed by walletId)
// a place that stores ingestionState (keyed by walletAddress)

import { error } from "console"
import { Wallet } from "../models"
import { ulid } from "ulid"

// addWallet(userId, address)
// removeWallet(walletId)
// listWallets(userId)
// countWallets(userId)

// this adds the wallets to the wallet list (max is 100 wallets)

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
    }

    //generate walletId
    // chain = solana
    const uniqueId = ulid()
    
    // createdAt = now
    
    //store it in the wallet state
    // initialize ingestionState (
    // status : "healthy"
    //lastProcessedSlot = 0
    // lastProcessedSignature = "null") 

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

