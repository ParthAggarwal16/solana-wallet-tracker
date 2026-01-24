// POST /wallets : 
// -- user adds wallet to the track
// -- validate address format
// -- enforce max 100 wallets
// -- persist wallet 
// -- initialize ingestion state
// -- call startIngestion (address)

// DELETE /wallet/:id :
// user stops tracking a wallet 
// mark wallet inactive 
// call stopIngestion

// GET /wallets :
// list tracked wallets and ingestion status
// returns : wallet address, chain, ingestion status (healthy, lagging, failed), lastProcessedSlot

// GET /healthy :
// backend liveliness 
// ingestion subsystem status (aggregate)