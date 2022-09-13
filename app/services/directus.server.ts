/*
We include two different directus related services.

This one is mostly used for frontend, or creating a user

The other (auth.server) is used for logging in, logging out and any data transactions that involve the user such as creating notes.
*/
import { Directus } from "@directus/sdk";

import { envSchema } from "~/env.server";

let env = envSchema.parse(process.env);

const directus = new Directus(env.DIRECTUS_URL);

export async function getDirectusClient() {
  //if (directus.auth.token) return directus; 
  if( env.DIRECTUS_STATIC_TOKEN ) {
    await directus.auth.static(env.DIRECTUS_STATIC_TOKEN);
  }
  return directus;
}

export function getAssetURL(id: any) {
  if (!id) return null;
  return `${env.DIRECTUS_URL}/assets/${id}`;
}