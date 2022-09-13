import type {
	LinksFunction,
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/utils/md.server";

import { getDirectusClient } from '~/services/directus.server'
import { getSeoMeta, getSeoLinks } from "~/seo";

import Container from '~/components/layout/Container'

export async function loader({ request, context, params }: LoaderArgs) {
    const directus = await getDirectusClient();


	try {
        const results = await directus.items("pages").readByQuery({
            filter: {
                slug: {
                  _eq: 'about',
                },
            },
            limit: -1,
            fields: ["*.*"],
        });
        const post = results.data![0];

        let body = parseMarkdown(post.body);

		let meta = {
			title: post.title,
		};

		return json({ body, meta });
	} catch {
		return redirect("/");
	}
}

export const meta: MetaFunction = ({data}) => {
	if (!data) return {};
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
	let { meta, body } = useLoaderData<typeof loader>();

	return (
		<Container>
			<div className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
				<article className="w-full prose dark:prose-dark max-w-none">
					<h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">{meta.title}</h1>
					<MarkdownView content={body} />
				</article>
			</div>
		</Container>
	);
}