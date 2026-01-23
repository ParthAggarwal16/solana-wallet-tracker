// required entities :
// user : id, email, created at timestamp
// wallet : id, userID, address, chain(solana), createdAt
// tranaction state : signature, slot, walletAddress, blockTime, direction(incoming, outgoing), amount, fee, success (boolean)
// ingestion : walletaddress, lastproccessedSlot, lastprocessedSignature, updatedAt

//defining the user models
interface User {
    id : string
    email : string
    createdAt : Date
}

//defining wallet interface 

type Chain = "solana"
interface Wallet {
    id : string
    userId : string
    address : string
    chain : Chain
    createdAt : Date
}

// defining transaction state interface 

type Direction = "incoming" | "outgoing"
interface TransactionState {
    signature : string
    slot : number 
    walletAddress : string
    blockTime?: number          // unix timestamp (seconds)
    direction : Direction
    amountLamports : number
    feeLamports : number
    success : boolean
    createdAt : Date
}

// defining ingestion models 

type IngestionStatus = "healthy" | "lagging" | "failed"
interface IngestionState {
    walletAddress : string 
    lastProcessedSlot : number
    lastProcessedSignature : string
    status : IngestionStatus
    updatedAt : Date
}

