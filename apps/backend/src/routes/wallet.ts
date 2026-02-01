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
import { z } from "zod"
import { addWallet, removeWallet, listWallets } from "../state/wallet.store"


export async function walletRoutes(server : FastifyInstance) {
    
    const addWalletSchema = z.object({
        address : z.string().min(1),
        chain : z.literal("solana").optional()
    })

    // health/sanity routes for wallet domain 
    server.get ("/wallet/health", async() => {
        return {status : "ok"}
        
    })

    // placeholders: list wallets 
    server.get ("/wallets", async(request, reply) => {
        
        return {
            wallets : []
        }
    })

    // placeholder: add wallets
    server.post ("/wallets",  async(request, reply) => {
        const {address, chain = "solana"} = request.body as {
            address : string
            chain? : "solana"
        }
        reply.code(201)

        return {
            walletId : "walletId_123", address, chain, ingestionStatus : "healthy"
        }
    })

    server.delete("/wallet/:walletId", {
        schema: {
            params: {
                type: "object",
                required : ["walletId"],
                properties: {
                    walletId : {type: "string", minLength : "1"}
                }
            },
            response: {
                200: {
                    type : "object",
                    required : ["walletId", "stopped"],
                    properties : {
                        walletId: {type : "string"},
                        stopped : {type : "boolean"}
                    } 
                }
            }
        }
    }, async(request, reply) => {
        const { walletId } = request.params as {
            walletId : string
            
        }
            reply.code(200)
            return {
                walletId, 
                stopped : true
            }
    })
}



