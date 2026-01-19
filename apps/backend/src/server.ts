//fastify instance and plugins 

import fastify from "fastify"
import sensible from "@fastify/sensible"

    //method used to register a route with path (in this case is "/wallet/:id")
    // with a handler (my function) , async means the function will return a prmoise 
    //then fastify will await it and send the resoved value as a HTTP response 
    //without async , i will have to manually send replies
    //basically , const { id } = request.params is pretty much just const id = request.params.id


const server = fastify()        //here server is not necceserily a fastify server , its more of a instance or big object
                                // with methods like .get , .post , .listen , .register

server.post("/wallet", {
  schema: {
    body: {
      type: "object",
      required: ["address"],
      properties: {
        address: { type: "string" },
        network: { type: "string", default: "solana" }
      }
    },
    response: {
      200: {
        type: "object",
        properties: {
          walletAddress: { type: "string" },
          network: { type: "string" }
        }
      }
    }
  }
}, async (request) => {
  const { address, network } = request.body as {
    address: string
    network: string
  }

  // domain level verification 

  if (!address.startsWith("So")) {
    throw server.httpErrors.badRequest ("invalid solana address")
  }

  //unsupported feature 

  if (network != "solana") { 
    throw server.httpErrors.notImplemented ("only solana is supported")
  }

  // simulated internal feature 
  const rpcHealthy = false
  if (!rpcHealthy) {
    throw new Error ("solana is down")
  }
  return {
    walletAddress: address,
    network
  }
})

server.listen({ port: 8080 })