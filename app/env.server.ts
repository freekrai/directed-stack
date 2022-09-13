import { z } from "zod";

export let envSchema = z.object({
	SESSION_SECRET: z.string().min(1),
	DIRECTUS_URL: z.string().min(1),
	DIRECTUS_STATIC_TOKEN: z.string().min(1),
	NODE_ENV: z
		.union([
			z.literal("test"),
			z.literal("development"),
			z.literal("production"),
		])
		.default("development"),
});

export type Env = z.infer<typeof envSchema>;