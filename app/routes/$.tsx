import type {
	LinksFunction,
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { CacheControl } from "~/utils/cache-control.server";
import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/utils/md.server";

import { getDirectusClient } from '~/services/directus.server'
import { getSeoMeta, getSeoLinks } from "~/seo";

import { removeTrailingSlash } from '~/utils'

import ErrorPage from '~/components/errorPage'
import Container from '~/components/layout/Container'

export async function loader ({request, params}: LoaderArgs) {
	try {
	  let apath = params["*"];
	  if (!apath) return redirect("/");
  
	  let path = removeTrailingSlash(apath)?.split("/").slice(-1).toString();
		const directus = await getDirectusClient();

		const results = await directus.items("pages").readByQuery({
			filter: {
				"_and": [
					{
						status: {
						'_eq': 'published'
						},
					},
					{
						slug: {
						_eq: path,
						},
					},
				],
			},
			limit: -1,
			fields: ["*.*"],
		});
		const post = results.data![0];

		let body = parseMarkdown(post.body);

		let meta = {
			title: post.title,
		};

		return json({ 
			body, 
			meta,
			error: null,
		}, {
			headers: {
				"Cache-Control": new CacheControl("swr").toString() 
			},
		});    
	} catch {
		return json({
			body: null,
			meta: null,
			error: '404 not found',
		})
	}
}

export const meta: MetaFunction = ({data}) => {
	if (!data.meta) return {};
	let { meta } = data as SerializeFrom<typeof loader>;

	let seoMeta = getSeoMeta({
		title: meta.title,
	});
	return {
		...seoMeta,
	};
}

export const links = () => {
	let seoLinks = getSeoLinks();
	return [...seoLinks];
};

export default function Article() {
	let { meta, body, error } = useLoaderData<typeof loader>();

	return (
		<Container>
			{error && <div className="p-12">
				<ErrorPage 
					code={404}
					title={`404: Not Found`} 
					message={`Oops! Looks like you tried to visit a page that does not exist.}`} 
            	/>
			</div>}
			{!error && <div className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
				<article className="w-full prose dark:prose-dark max-w-none">
					{meta && meta.title && <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">{meta.title}</h1>}
					{body && <MarkdownView content={body} />}
				</article>
			</div>}
		</Container>
	);
}