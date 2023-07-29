/* eslint-disable react-hooks/rules-of-hooks */
import { createDirectus } from '@directus/sdk';
import { staticToken } from '@directus/sdk/auth';
import { 
	rest, 
	aggregate, 
	createUser, 
	readSingleton, 
	readItem, 
	readItems, 
	createItem, 
	updateItem, 
	deleteItem } from '@directus/sdk/rest';
import { graphql } from '@directus/sdk/graphql';
//import { realtime } from '@directus/sdk/realtime';

import { envSchema } from "~/env.server";

let env = envSchema.parse(process.env);

export const directus = createDirectus(env.DIRECTUS_URL).with( rest() ).with( graphql() ).with( staticToken(env.DIRECTUS_STATIC_TOKEN) );

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
	return directus;
}

/*
export async function getDirectusRealtimeClient() {
	return createDirectus(env.DIRECTUS_URL).with( realtime() ).with( staticToken(env.DIRECTUS_STATIC_TOKEN) );
}
*/

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

// return a count, grouped by status and return only published items...
export async function getItemsCount(collection: string, status='published') {
	const result = await directus.request(
		aggregate(collection, {
			aggregate: { count: '*' },
			groupBy: ['status'],
		})
	);
	// only filter by status...
	const published = result.filter( (r:any) => r.status === status );
	return published[0].count as unknown as number;
}

export async function getAggregate(collection: string, status='published') {
	const result = await directus.request(
		aggregate(collection, {
			aggregate: { count: '*' },
			groupBy: ['status'],
		})
	);
	// only filter by status...
	const published = result.filter( (r:any) => r.status === status );
	return published[0].count as unknown as number;
}

export async function getSingleton(collection: string, query?: DirectusQuery) {
	return directus.request( readSingleton(collection, query || {}) );
}

export async function getItemsByQuery(collection: string, query: DirectusQuery) {
	return directus.request( readItems(collection, query) );
}

export async function readByQuery(collection: string, query: DirectusQuery) {
	return directus.request( readItems(collection, query) );
}

export async function readOne(collection: string, id: string) {
	return directus.request( readItem(collection, id) );
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

export async function readBySlug(collection: string, slug: string, status='any') {
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
	const results = await readByQuery(collection, {
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

export async function createOne(collection: string, data: any) {
	return directus.request(
		createItem(collection, data)
	);
}

export async function updateOne(collection: string, id: any, data: any) {
	return directus.request(
		updateItem(collection, id, data)
	);
}

export async function deleteOne(collection: string, id: any) {
	return directus.request( deleteItem(collection, id) );
}

// if id, we update, otherwise we create an item in the specified collection...
export async function upsertOne(collection: string, data: any, id?: string) {
	if( id ) {
		return directus.request(
			updateItem(collection, id, data)
		);	
	} else {
		return directus.request(
			createItem(collection, data)
		);
	}
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