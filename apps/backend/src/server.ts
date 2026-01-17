//fastify instance and plugins

import fastify from "fastify"

const server = fastify()

//path parametre 

server.get("/wallet/:id", async (request) => {
    const id = request.params as { id : string }
    return  {
        walletID : id
    }
})

server.listen ({ port : 8080 })

server.get("/wallet/:id?network=solana", async (request) => {
    const networkName = request.query as { networkName : string}
    return {
        foundNetwork : networkName
    }
})