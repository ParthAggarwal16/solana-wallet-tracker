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
    server.get ("/wallets", {
        schema : { 
            response : {
                200 : {
                    type : "object",
                    required : ["wallets"],
                    properties : {
                        wallets : {type : "array",
                            items : {
                                type : "object",
                                required : ["walletId", "address","chain","ingestionStatus","lastProcessedSlot"],
                                properties : {
                                    walletId : {type : "string"},
                                    address : {type : "string"},
                                    chain : {type : "string", enum : ["solana"]},
                                    ingestionStatus : {type : "string", enum : ["healthy", "lagging", "failed"]},
                                    lastProcessedSlot : {type : "number"}
                                }
                            }
                        }
                    }
                }
            }
        }
    }, async(request, reply) => {

        return {
            wallets : []
        }
    })

    // placeholder: add wallets
    server.post ("/wallets", {
        schema: {
            body: {
                type: "object",
                required : ["address"], 
                properties: {
                    address: {type : "string", minLength : "1" },
                    chain : {type : "string", enum: ["solana"], default : "solana"}
                }
            },
            response: {
                201: {
                    type : "object",
                    required : ["walletId", "address", "chain", "ingestionStatus"],
                    properties : {
                        walletId : {type : "string"},
                        address : {type : "string"},
                        chain : {type : "string", enum : ["solana"]},
                        ingestionStatus : {type : "string", enum : ["healthy", "lagging", "failed"]}
                    }
                }
            }

        }
    },  async(request, reply) => {
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
                    walletId : {type: "string", minLenght : "1"}
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



