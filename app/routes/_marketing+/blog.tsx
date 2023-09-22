import type {
	DataFunctionArgs,
	MetaFunction,
} from "@vercel/remix";

import { defer } from "@vercel/remix";
import { 
	Await,
	Link, 
	useLoaderData, 
} from "@remix-run/react";
import { Suspense } from 'react';
import { CacheControl } from "~/utils/cache-control.server";
import { parseISO, format } from 'date-fns';
import { Icon } from '~/components/icons'

import { readByQuery, getItemsCount } from '~/services/directus.server'
import Container from '~/components/layout/Container'

import getSeo from '~/seo';

export const meta: MetaFunction = ({ data, matches }) => {
	if(!data) return [];
	//let { meta } = data as SerializeFrom<typeof loader>;
  	//const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
        	title: data.meta.title,
			description: '',
        	//url: `${parentData[0].requestInfo.url}`,
        }),
	  ];
}

export async function loader({ request, context }: DataFunctionArgs) {
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
        sort: "-published",
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

	return defer({ 
		term, 
		page, 
		posts, 
		meta 
	}, {
		headers: {
		  'Cache-Control': 'private, max-age=3600',
		  'Vary': 'Cookie',
		},
	})
}

export function headers() {
	return {
	  "Cache-Control": new CacheControl("swr").toString(),
	  'Vary': 'Cookie',
	};
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
							<Suspense fallback={<strong>Loading...</strong>}>
								<Await resolve={posts}>
									{(posts) => <>
										{posts && posts.map((post) => (
											<div 
												key={post.id}
												className="mb-2 border border-indigo-200 rounded-md p-4 m-2 group"
											>
												<Link 
													key={post.id} 
													to={`/blog/${post.slug}`} 
													prefetch="intent"
													className="text-indigo-600 hover:text-gray-600"
												>
													<div className="mb-2">
														<time dateTime={post.published} className="text-gray-300 text-sm">
															{format(parseISO(post.published), 'MMMM dd, yyyy')}
														</time>
													</div>
													<h2
														className="text-xl font-semibold text-indigo-600 group-hover:text-gray-600"
													>
														{post.title}
													</h2>
													{post.excerpt && <p className="leading-relaxed text-gray-600 text-sm dark:text-gray-400">{post.excerpt}...</p>}
													<div 
														className="mt-2 flex items-center flex-wrap group">
														<span
															className="text-base text-md font-semibold "
														>
															Read full story 
														</span>
														<Icon name="arrow-right" className="w-4 h-4" />
													</div>
												</Link>
											</div>
										))}
									</>}
								</Await>
							</Suspense> 							
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
