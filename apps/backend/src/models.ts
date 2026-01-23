// required entities :
// user : id, email, created at timestamp
// wallet : id, userID, address, chain(solana), createdAt
// tranaction state : signature, slot, walletAddress, blockTime, direction(incoming, outgoing), amount, fee, success (boolean)
// ingestion : walletaddress, lastproccessedSlot, lastprocessedSignature, updatedAt

//defining the user models
interface user {
    userID : string
    email : string
    createdAt : Date
}

//defining wallet interface 
interface wallet {
    walletID : string
    userID : string
    walletAddress : string
    chain : string | "solana"
    walletCreatedAt : Date
}

// defining transaction state interface 
interface transactionState {
    signature : string
    slot : number 
    walletAddress : string
    blockTime : null
    direction : string | "incoming" | "outgoing"
    amount : number
    fee : number
    success : boolean
}

// defining ingestion models 
interface ingestion {
    walletAddress : string 
    lastprocessedSlot : number
    lastproccessedSignature : string
    updatedAt : Date
}

