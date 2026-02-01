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

    const walletIdSchema = z.uuid()
    const deleteWalletSchemaParams = z.object({
        walletId : walletIdSchema
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
                issues : z.treeifyError(parsed.error)
            } 
        }

        const {address, chain = "solana"} = parsed.data

        const wallet = await addWallet(userId, address)

        reply.code(201)
        return {wallet}
    })

    // health/sanity routes for wallet domain 
    server.get ("/wallet/health", async() => {

        //empty for now as ingestion health aggregation needs lag thresholds, failed walletcounts, ingestionStore scan
        return {status : "ok"}
        
    })

    // placeholders: list wallets 
    server.get ("/wallets", async(request, reply) => {

        // temporary until i do auth
        const userId = "user1"

        const wallets = await listWallets(userId)
        
        reply.code(200)
        return {
            wallets
        }
    })


    server.delete("/wallet/:walletId", async(request, reply) => {

        //again definfin temporary userId until i do auth
        const userId = "user1"

        // note : walletId lives inside params (not body), pls dont forget this ffs
        const parsed = deleteWalletSchemaParams.safeParse(request.params)

        if (!parsed.success){
            reply.code(400)
            return {
                issues : z.treeifyError(parsed.error),
                error : "invalid walletId"
            }
        }
        const { walletId } = parsed.data

        await removeWallet(walletId)
        
        reply.code(200)
        
        return {
            walletId, stopped : "true"
        }
    })
}



