//fastify instance and plugins

import fastify from "fastify"

const server = fastify()

//path parametre 

server.get("/wallet/:id", function (request) {
    const userID = request.params;
})

