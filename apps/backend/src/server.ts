//fastify instance and plugins

import fastify from "fastify"
import { request } from "http"

const server = fastify()

//path parametre 

server.get("/wallet/:id", function (request) {
    const userID = request.params
})

