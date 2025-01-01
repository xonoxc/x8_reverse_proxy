import cluster, { Worker } from "node:cluster"
import http from "node:http"
import { rootConfigSchema, rootConfigType } from "./config-schema"
import {
     WorkerMessageType,
     workerMessageSchema,
     WorkerMessageReplyType,
     workerMessageReplySchema,
} from "./server-schema"

interface ServerConfig {
     port: number
     workerCount: number
     config: rootConfigType
}

export async function createServer(config: ServerConfig) {
     const { workerCount } = config

     const WORKER_POOL: Worker[] = []

     if (cluster.isPrimary) {
          console.log("Master process is up...")
          for (let i = 0; i < workerCount; i++) {
               const w = cluster.fork({ config: JSON.stringify(config.config) })
               WORKER_POOL.push(w)
               console.log(`Master process : worker node spinned up ${i}`)
          }

          const server = http.createServer((req, res) => {
               const index = Math.floor(Math.random() * WORKER_POOL.length)
               const worker = WORKER_POOL.at(index)

               if (!worker) throw new Error("Worker not found")

               const payload: WorkerMessageType = {
                    reqType: "HTTP",
                    headers: req.headers,
                    body: null,
                    url: req.url as string,
               }

               worker.send(JSON.stringify(payload))

               worker.on("message", async (workerReply: string) => {
                    const reply = await workerMessageReplySchema.parseAsync(
                         JSON.parse(workerReply)
                    )
                    if (reply.errorCode) {
                         res.writeHead(parseInt(reply.errorCode))
                         res.end(reply.error)
                         return
                    } else {
                         res.writeHead(200)
                         res.end(reply.data)
                         return
                    }
               })
          })

          server.listen(config.port, () => {
               console.log(
                    `Reverse porxy x8 is listening on port ${config.port}`
               )
          })
     } else {
          const config = await rootConfigSchema.parseAsync(
               JSON.parse(process.env.config as string)
          )

          process.on("message", async message => {
               const validatedMessage = await workerMessageSchema.parseAsync(
                    JSON.parse(message as string)
               )

               const requestURL = validatedMessage.url
               const rule = config.server.rules.find(e => e.path === requestURL)

               if (!rule) {
                    const reply: WorkerMessageReplyType = {
                         errorCode: "404",
                         error: "Rule not found",
                    }
                    if (process.send) return process.send(JSON.stringify(reply))
               }

               const upstreamID = rule?.upstrams[0]
               const upstream = config.server.upstream.find(
                    stream => stream.id === upstreamID
               )

               if (!upstreamID) {
                    const reply: WorkerMessageReplyType = {
                         errorCode: "404",
                         error: "UpstreamID not found",
                    }
                    if (process.send) return process.send(JSON.stringify(reply))
               }

               http.request(
                    { host: upstream?.url, path: requestURL },
                    proxyRes => {
                         let body = ""

                         proxyRes.on("data", chunk => {
                              body += chunk
                         })

                         proxyRes.on("end", () => {
                              const reply: WorkerMessageReplyType = {
                                   data: body,
                              }
                              if (process.send)
                                   return process.send(JSON.stringify(reply))
                         })
                    }
               )
          })
     }
}
