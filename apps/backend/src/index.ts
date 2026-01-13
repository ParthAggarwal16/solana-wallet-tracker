// this file will :
// load config
// create HTTP server
// start listening to a port

import fastify from 'fastify'

const server = fastify()

server.get('/', async (request, response) =>{
    return {
        name : "solana wallet tracker ",
        status : "ok"
    }
})

server.listen ({ port : 8080 }, (err, address) =>{
    if (err){
        console.error(err)
        process.exit(1)
    }
    console.log (`server listening at ${address}`)
});
