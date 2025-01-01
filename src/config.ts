import { parse } from "yaml"
import fs from "node:fs/promises"
import { rootConfigSchema } from "./config-schema"

async function parseYamlConfig(filepath: string) {
     const configFileContent = await fs.readFile(filepath, "utf8")
     const parsedConfig = parse(configFileContent)
     return JSON.stringify(parsedConfig)
}

async function validateSchema(config: string) {
     const validatedConfig = await rootConfigSchema.parseAsync(
          JSON.parse(config)
     )

     return validatedConfig
}

export { parseYamlConfig, validateSchema }
