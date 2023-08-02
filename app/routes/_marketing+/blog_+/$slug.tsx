import type {
	LoaderArgs,
	V2_MetaFunction,
} from "@vercel/remix";
import { parseISO, format } from 'date-fns';
import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/utils/md.server";
import { readBySlug, getAssetURL } from '~/services/directus.server'
import { jsonHash } from 'remix-utils';
import Container from '~/components/layout/Container'
import { readingTime } from '~/utils';

import getSeo from '~/seo';

//export const config = { runtime: 'edge' };

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
	if (!params.slug) {
		throw new Error('params.slug is not defined')
	}

	const post = await readBySlug("posts", params.slug);

	if (!post) {
		throw new Response('Not found', { status: 404 })
	}    

	// jsonHash lets us define functions directly in the json, reducing the need to create extra functions and variables.
	return jsonHash({ 
		post,
		async body() {
			return parseMarkdown(post.body)
		},
		async photo() {
			return post.image ? getAssetURL(post.image) : null;
		},
		async readTime() {
			return readingTime(post.body);
		},
		async meta() {
			return {
				title: post.title,
				description: post.excerpt,
				createdAt: post.created_at,
				published: post.published,
				author: `${post.author.first_name} ${post.author.last_name}`,
			}
		}
	}, {
		headers: {
			"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
		},
	});    
}

export default function Article() {
	let { body, photo, readTime, meta } = useLoaderData<typeof loader>();

	return (
		<Container>
			<article className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
				<h1 className="mb-4 text-3xl font-bold tracking-tight text-blue-800 md:text-5xl dark:text-white">{meta.title}</h1>
				<div className="flex flex-col items-start justify-between w-full mt-2 md:flex-row md:items-center">
					<div className="flex items-center">
						<p className="text-sm text-gray-700 dark:text-gray-300">
							{meta.author}
							{' • '}
							{meta.published && format(parseISO(meta.published), 'MMMM dd, yyyy')}
						</p>
					</div>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400 min-w-32 md:mt-0">
            			{readTime && <>{readTime} min read</>}
          			</p>
				</div>
				{photo && <div className="my-2">
					<img 
						className="w-full rounded-lg shadow-lg object-cover object-center"
						src={photo}
						alt={meta.title}
					/>
				</div>}
				<div className="w-full mt-4 prose dark:prose-dark max-w-none">
					<MarkdownView content={body} />
				</div>
			</article>
		</Container>
	);
}