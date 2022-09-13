import type {
	LinksFunction,
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/node";
import { parseISO, format } from 'date-fns';
import calculateReadingTime from 'reading-time'

import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/utils/md.server";

import { getDirectusClient, getAssetURL } from '~/services/directus.server'
import { getSeoMeta, getSeoLinks } from "~/seo";

import Container from '~/components/layout/Container'

export async function loader({ request, context, params }: LoaderArgs) {
    const directus = await getDirectusClient();

	let path = params["*"];
	if (!path) return redirect("/blog");

	try {
        const results = await directus.items("posts").readByQuery({
            filter: {
                slug: {
                  _eq: path,
                },
            },
            limit: -1,
            fields: ["*.*"],
        });
        const post = results.data![0];


		const readTime = calculateReadingTime(post.body);
        let body = parseMarkdown(post.body);
		const photo = post.image ? getAssetURL(post.image) : null;

		let meta = {
			title: post.title,
			description: post.excerpt,
			createdAt: post.created_at,
			author: `${post.author.first_name} ${post.author.last_name}`,
			photo: photo,
			readTime: readTime,
		};

		return json({ body, meta });
	} catch {
		return redirect("/blog");
	}
}

export const meta: MetaFunction = ({data}) => {
	if (!data) return {};
	let { meta } = data as SerializeFrom<typeof loader>;

	let seoMeta = getSeoMeta({
		title: meta.title,
		description: meta.description,
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