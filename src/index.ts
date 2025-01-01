import { program } from "commander"
import { validateSchema, parseYamlConfig } from "./config"
import os from "node:os"
import { createServer } from "./server"

async function main() {
     program.option("--config <path>")
     program.parse()

     const opts = program.opts()
     if (opts && "config" in opts) {
          const validatedConfig = await validateSchema(
               await parseYamlConfig(opts.config)
          )
          await createServer({
               port: validatedConfig.server.listen,
               workerCount: validatedConfig.server.workers ?? os.cpus().length,
               config: validatedConfig,
          })
     }
}

main()
