import type {
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";

import { getDirectusClient } from '~/services/directus.server'
import { getSeoMeta, getSeoLinks } from "~/seo";
import Container from '~/components/layout/Container'

export async function loader({ request, context }: LoaderArgs) {
    const directus = await getDirectusClient();

	let url = new URL(request.url);

	let term = url.searchParams.get("q") ?? "";
	let page = Number(url.searchParams.get("page") ?? 1);
    let limit = 40;

    let offset = 0;
    if (limit === -1 ) {
      // ddd
    } else {
      if( page > 1 ) {
        offset = page * limit;
      }
    }
    const results = await directus.items("posts").readByQuery({
        filter: {
			status: {
				'_eq': 'published'
			}
        },
        search: term,
        offset,
        limit,
        fields: ["*.*"],
        meta: 'total_count',
        //sort: ["-created"],
    });
    const posts = results.data;
    let meta = {
        title: 'Blog ',
    }
    const pagination = {
        total: results.meta.total_count,
        pageCount: Math.floor(results.meta.total_count / limit),
        page: page,
        prev: 0,
        next: 0,
    }
    if( pagination.pageCount > pagination.page ) {
        pagination.next = +pagination.page + 1;
    }
    if( pagination.page > 1 ) {
        pagination.prev = +pagination.page - 1;
    }
    
    if (page !== 1) meta.title = `Page "${1} of ${pagination.pageCount}`
	if (term !== "") meta.title = `Search results for "${term}"`

	return json({ term, page, posts, meta });
}
/*
export let meta: MetaFunction = ({ data }) => {
	if (!data) return {};
	let { meta } = data as SerializeFrom<typeof loader>;
	return meta;
};
*/
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


export default function Articles() {
	let { posts, term, page } = useLoaderData<typeof loader>();
	let { submission } = useTransition();

	let count = posts.length;
/*
	if (count === 0) {
		return (
			<main className="space-y-4">
				<h2 className="text-3xl font-bold">404</h2>
				<p>{page}</p>
			</main>
		);
	}
*/
	return (
		<Container>
			<div className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
				<main className="w-full">
					<header>
						<h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">Blog</h1>
						{term ? (
							<p className="text-xl text-gray-900 dark:text-gray-200">
								Search results for <em className="quote">"{term}"</em>
							</p>
						) : (
							<p className="text-xl text-gray-900 dark:text-gray-200">
								
							</p>
						)}
					</header>
					<div className="space-y-4 w-full">
						<Form action="." method="get" role="search" className="p-4">
							<label htmlFor="q" className="block pl-4 text-lg font-semibold dark:text-gray-200">
								Search
							</label>
							<div className="flex items-center space-x-4">
								<input
									id="q"
									type="search"
									name="q"
									defaultValue={term}
									className="flex-grow rounded-full py-2 px-4"
									placeholder="search"
								/>
								<button
									type="submit"
									className="rounded-full border border-gray-900 bg-gray-800 dark:bg-gray-400 px-4 py-2 text-white "
								>
									{submission
										? "🔎"
										: "🔍"}
								</button>
							</div>
						</Form>
						<div className="space-y-2 w-full">
							{posts && posts.map((post) => (
								<div key={post.id}>
									<Link to={`/blog/${post.slug}`} prefetch="intent" className="dark:text-gray-200">
										<h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
									</Link>
									{post.excerpt && <p className="text-gray-600 dark:text-gray-400 truncate">{post.excerpt}...</p>}
									<div className="mt-3">
										<Link to={`/blog/${post.slug}`} prefetch="intent" className="text-base font-semibold text-indigo-600 hover:text-indigo-500">
											Read full story
										</Link>
									</div>
								</div>
							))}
						</div>
					</div>

					<footer className="flex w-full justify-evenly">
						{page > 1 && (
							<Link to={`/blog?page=${page - 1}`} prefetch="intent">
								Older Posts
							</Link>
						)}
						{count === 40 && (
							<Link to={`/blog?page=${page + 1}`} prefetch="intent">
								News Posts
							</Link>
						)}
					</footer>
				</main>
			</div>
		</Container>
	);
}
