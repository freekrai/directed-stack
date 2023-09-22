import type {
	DataFunctionArgs,
	MetaFunction,
} from "@vercel/remix";

import { useLoaderData } from "@remix-run/react";

import { CacheControl } from "~/utils/cache-control.server";
import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/utils/md.server";

import { readBySlug } from '~/services/directus.server'

import { jsonHash } from '~/utils/trenta/jsonhash';
import Container from '~/components/layout/Container'

import getSeo from '~/seo';

//export const config = { runtime: 'edge' };

export const meta: MetaFunction = ({ data, matches }) => {
	if(!data) return [];
	//let { meta } = data as SerializeFrom<typeof loader>;
  	//const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
        	title: data.meta.title,
			description: '',
        }),
	  ];
}

export async function loader ({request, params}: DataFunctionArgs) {
	if (!params.page) {
		throw new Error('params.slug is not defined')
	}

	const page = await readBySlug("pages", params.page);

	if (!page) {
		throw new Response('Not found', { status: 404 })
	}

	return jsonHash({ 
		async body () {
			return parseMarkdown(page.body);
		}, 
		meta: {
			title: page.title
		},
	}, {
		headers: {
			"Cache-Control": new CacheControl("swr").toString() 
		},
	});    
}

export default function Article() {
	let { meta, body } = useLoaderData<typeof loader>();

	return (
		<Container>
			<div className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
				<article className="w-full prose dark:prose-dark max-w-none">
					{meta && meta.title && <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">{meta.title}</h1>}
					{body && <MarkdownView content={body} />}
				</article>
			</div>
		</Container>
	);
}