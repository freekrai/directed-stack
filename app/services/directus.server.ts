/* eslint-disable react-hooks/rules-of-hooks */
/*
We include two different directus related services.

This one is mostly used for frontend, or creating a user

The other (auth.server) is used for logging in, logging out and any data transactions that involve the user such as creating notes.
*/
import { createDirectus } from '@directus/sdk';
import { authentication, staticToken } from '@directus/sdk/auth';
import { rest, aggregate, createUser, readSingleton, readItem, readItems, createItem, updateItem, deleteItem } from '@directus/sdk/rest';
import { graphql } from '@directus/sdk/graphql';

import { envSchema } from "~/env.server";

let env = envSchema.parse(process.env);

const directus = createDirectus(env.DIRECTUS_URL).
	with( authentication() ).
	with( rest() ).
	with( graphql() ).
	with( staticToken(env.DIRECTUS_STATIC_TOKEN) );

function serializeSearchParams(obj: any, prefix = ''): string {
	const str:string[] = [];
	let p;
	for (p in obj) {
		// eslint-disable-next-line no-prototype-builtins
		if (obj.hasOwnProperty(p)) {
			const k = prefix ? prefix + '[' + p + ']' : p;
			const v = obj[p];
			str.push(
				v !== null && typeof v === 'object'
					? serializeSearchParams(v, k)
					: encodeURIComponent(k) + '=' + encodeURIComponent(v)
			);
		}
	}
	return str.join('&');
}


export async function getDirectusClient() {
  //if (await directus.auth.token) return directus; 
  if( env.DIRECTUS_STATIC_TOKEN ) {
    await directus.setToken(env.DIRECTUS_STATIC_TOKEN);
  }

  return directus;
}

export type DirectusQuery = {
  fields: string[];
  filter?: any | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  search?: string | undefined;
  page?: number | undefined;
  meta?: any | undefined;
  sort?: string | undefined;
}

export async function getItemsCount(collection: string) {
	const result = await directus.request(
		aggregate(collection, {
			aggregate: { count: '*' },
			//groupBy: 'id',
		})
	);
	return result[0].count as unknown as number;
}

export async function getSingleton(collection: string, query?: DirectusQuery) {
	return directus.request( readSingleton(collection, query || {}) );
}

export async function getItemsByQuery(collection: string, query: DirectusQuery) {
	return directus.request( readItems(collection, query) );
}

export async function getItemBySlug(collection: string, slug: string, status='any') {
	let filter: any = {}

	// otherwise if "any" then any status...
	if( status === 'any' ) {
		filter = {
			slug: {
				_eq: slug,
			},
		}
	} else {
		filter = {
			"_and": [
				{
					status: {
						'_eq': status
					},
				},
				{
					slug: {
						_eq: slug,
					},
				}
			]
		}
	}
	const results = await getItemsByQuery(collection, {
		filter: filter,
		limit: 1,
		fields: ["*.*"],
	});
	// we return a single result here...
    return results[0];
}

export async function getItemById(collection: string, id: string) {
	return directus.request( readItem(collection, id) );
}

export async function graphqlQuery( query: string ) {
	return directus.query( query );
}

export function getAssetURL(image: any, urlParamsObject = {} ) {
  if (!image) return null;

  let id = image;
  if ( typeof image === 'object' ) { 
    id = image.id;
  }
  if (!id) return null;
  let queryString = serializeSearchParams(urlParamsObject)
  return `${process.env.DIRECTUS_URL}/assets/${id}${queryString ? `?${queryString}` : ""}`;
}

// export to include as needed...
export {
	readItem, 
	readSingleton,
	readItems, 
	createItem, 
	updateItem, 
	deleteItem,
	aggregate,
	createUser
}
