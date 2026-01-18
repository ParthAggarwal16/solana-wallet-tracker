//fastify instance and plugins 

import fastify from "fastify"

const server = fastify()        //here server is not necceserily a fastify server , its more of a instance or big object
                                // with methods like .get , .post , .listen , .register

//my first shot at path and query parametres

server.get("/wallet/:id", async (request, reply) => {                  
    //method used to register a route with path (in this case is "/wallet/:id")
    // with a handler (my function) , async means the function will return a prmoise 
    //then fastify will await it and send the resoved value as a HTTP response 
    //without async , i will have to manually send replies
    //basically , const { id } = request.params is pretty much just const id = request.params.id

    const body = request.body as {
        address?: unknown 
        network?: unknown
    }

    if (typeof body !== "object" || body === null) {
        return reply.status(400).send({ error: "Invalid JSON body" })
    }

    if (typeof body.address !== "string") {
        return reply.status(400).send({ error: "address must be a string" })
    }

    if (body.network !== undefined && typeof body.network !== "string") {
        return reply.status(400).send({ error: "network must be a string" })
    }

    const { id } = request.params as { id: string }             
    const { network } = request.query as { network?: string }

    return {
        walletId: id,
        network: network ?? "default"
    }
})

server.listen({ port: 8080 })