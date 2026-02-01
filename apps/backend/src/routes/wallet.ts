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
    
    // placeholder: add wallets
    server.post ("/wallets",  async(request, reply) => {
        
        //temporary userID until i implement auth
        const userId = "user1"

        //zod parsing
        const parsed = addWalletSchema.safeParse(request.body)
        if (!parsed.success){
            reply.code(401)
            return {
                error : "invalid request body",
                issues : parsed.error.flatten
            } 
        }

        const {address, chain = "solana"} = parsed.data

        const wallet = await addWallet(userId, address)

        reply.code(201)
        return {wallet}
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



