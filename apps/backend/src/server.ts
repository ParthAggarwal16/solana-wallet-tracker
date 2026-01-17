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

