import type {
	LinksFunction,
	LoaderArgs,
	V2_MetaFunction,
	SerializeFrom,
} from "@vercel/remix";
import { parseISO, format } from 'date-fns';
import calculateReadingTime from 'reading-time'

import { json, redirect } from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/utils/md.server";
import { CacheControl } from "~/utils/cache-control.server";
import { readBySlug, getAssetURL } from '~/services/directus.server'

import Container from '~/components/layout/Container'

import getSeo from '~/seo';

export const meta: V2_MetaFunction = ({ data, matches }) => {
	if(!data) return [];
	//let { meta } = data as SerializeFrom<typeof loader>;
  	const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
        	title: data.meta.title,
			description: data.meta.excerpt,
        	url: `${parentData[0].requestInfo.url}`,
        }),
	];
}

export async function loader({ request, context, params }: LoaderArgs) {
	let path = params["*"];
	if (!path) return redirect("/blog");

	try {
		const post = await readBySlug("posts", path, 'published');

		const readTime = calculateReadingTime(post.body);
        let body = parseMarkdown(post.body);
		const photo = post.image ? getAssetURL(post.image) : null;

		return json({ 
			body,
			meta: {
				title: post.title,
				description: post.excerpt,
				createdAt: post.created_at,
				author: `${post.author.first_name} ${post.author.last_name}`,
				photo: photo,
				readTime: readTime,
			}
		}, {
			headers: {
				"Cache-Control": new CacheControl("swr").toString() 
			},
		});    
	} catch {
		return redirect("/blog");
	}
}


export default function Article() {
	let { body, meta } = useLoaderData<typeof loader>();

	return (
		<Container>
			<article className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
				<h1 className="mb-4 text-3xl font-bold tracking-tight text-blue-800 md:text-5xl dark:text-white">{meta.title}</h1>
				<div className="flex flex-col items-start justify-between w-full mt-2 md:flex-row md:items-center">
					<div className="flex items-center">
						<p className="text-sm text-gray-700 dark:text-gray-300">
							{meta.author}
							{' • '}
							{meta.createdAt && format(parseISO(meta.createdAt), 'MMMM dd, yyyy')}
						</p>
					</div>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400 min-w-32 md:mt-0">
            			{meta.readTime.text}
          			</p>
				</div>
				{meta.photo && <div className="my-2">
				<img 
					className="w-full rounded-lg shadow-lg object-cover object-center"
					src={meta.photo}
				/>
				</div>}
				<div className="w-full mt-4 prose dark:prose-dark max-w-none">
					<MarkdownView content={body} />
				</div>
			</article>
		</Container>
	);
}