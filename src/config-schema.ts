import { z } from "zod"

const upstreamSchema = z.object({
     id: z.string(),
     url: z.string(),
})

const headersSchema = z.object({
     key: z.string(),
     value: z.string(),
})

const ruleSchema = z.object({
     path: z.string(),
     upstrams: z.array(z.string()),
})

const serverSchema = z.object({
     listen: z.number(),
     workers: z.number().optional(),
     upstream: z.array(upstreamSchema),
     headers: z.array(headersSchema).optional(),
     rules: z.array(ruleSchema),
})

export const rootConfigSchema = z.object({ server: serverSchema })

export type rootConfigType = z.infer<typeof rootConfigSchema>
