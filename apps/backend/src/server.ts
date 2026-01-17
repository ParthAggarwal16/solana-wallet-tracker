//fastify instance and plugins 

import fastify from "fastify"

const server = fastify()        //here server is not necceserily a fastify server , its more of a instance or big object
                                // with methods like .get , .post , .listen , .register

//my first shot at path and query parametres

server.get("/wallet/:id", async (request) => {                  //method used to register a route with path (in this case is "/wallet/:id")
                                                                // with a handler (my function) , async means the function will return a prmoise 
                                                                //then fastify will await it and send the resoved value as a HTTP response 
                                                                //without async , i will have to manually send replies
    const { id } = request.params as { id: string }             
    const { network } = request.query as { network?: string }

    return {
        walletId: id,
        network: network ?? "default"
    }
})

server.listen({ port: 8080 })