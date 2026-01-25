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

import { FastifyInstance } from "fastify"

export async function walletRoutes(server : FastifyInstance) {

    // health/sanity routes for wallet domain 
    server.get ("/wallet/health", async() => {
        return {status : "ok"}
    })

    // placeholders: list wallets 
    server.get ("/wallets", async() => {
        return []
    })

    // placeholder: add wallets
    server.post ("/wallet", async(request, reply) => {
        const {address, chain = "solana"} = request.body as {
            address : string
            chain? : "solana"
        }
        reply.code(201)

        return {
            walletId : "walletId_123", address, chain, ingestionStatus : "healthy"
        }
    })
}

