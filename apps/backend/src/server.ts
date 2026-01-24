//fastify instance and plugins

import fastify from "fastify"

const server = fastify()


server.listen ({port : 8080}, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`server listening at ${address}`)
})

