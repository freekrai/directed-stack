import type {
	LoaderArgs,
	V2_MetaFunction,
	SerializeFrom,
} from "@vercel/remix";

import { json } from "@vercel/remix";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import { readByQuery, getItemsCount } from '~/services/directus.server'
import Container from '~/components/layout/Container'

import getSeo from '~/seo';

export const meta: V2_MetaFunction = ({ data, matches }) => {
	if(!data) return [];
	//let { meta } = data as SerializeFrom<typeof loader>;
  	const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
        	title: data.meta.title,
			description: '',
        	url: `${parentData[0].requestInfo.url}`,
        }),
	  ];
}

export async function loader({ request, context }: LoaderArgs) {
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
	
	const total = await getItemsCount('posts');
    const posts = await readByQuery("posts", {
        filter: {
			status: {
				'_eq': 'published'
			}
        },
        search: term,
        offset,
        limit,
        fields: ["*.*"],
        //sort: ["-created"],
    });

    let meta = {
        title: 'Blog ',
    }
    const pagination = {
        total: total,
        pageCount: Math.floor(total / limit),
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

export default function Articles() {
	let { posts, term, page } = useLoaderData<typeof loader>();

	let count = posts.length;
	return (
		<Container>
			<div className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
				<main className="w-full">
					<header>
						<h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">Blog</h1>
					</header>
					<div className="space-y-4 w-full">
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
								Newer Posts
							</Link>
						)}
						{count === 40 && (
							<Link to={`/blog?page=${page + 1}`} prefetch="intent">
								Older Posts
							</Link>
						)}
					</footer>
				</main>
			</div>
		</Container>
	);
}
