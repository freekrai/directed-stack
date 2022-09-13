import type {LoaderArgs} from '@remix-run/node'
import { createSitemap } from '~/utils/sitemap.server';
import {getDirectusClient} from '~/services/directus.server';
import { CacheControl } from "~/utils/cache-control.server";
import {getDomainUrl} from '~/utils/'

export const loader = async ({request}: LoaderArgs) => {

    const directus = await getDirectusClient();

    const blogUrl = `${getDomainUrl(request)}`

    // get all published pages
    const pages = await directus.items("pages").readByQuery({
        filter: {
			status: {
				'_eq': 'published'
			}
        },
        offset: 0,
        limit: -1,
        fields: ["*.*"],
        meta: 'total_count',
    });

    // get all published posts
    const posts = await directus.items("posts").readByQuery({
        filter: {
			status: {
				'_eq': 'published'
			}
        },
        offset: 0,
        limit: -1,
        fields: ["*.*"],
        meta: 'total_count',
    });

    const pageUrls = pages && pages.data && pages.data.map( page => {
        return {url: `${blogUrl}/${page.slug}`}
    }) || []

    const postUrls = posts && posts.data && posts.data.map( post => {
        return {url: `${blogUrl}/blog/${post.slug}`}
    }) || []


    const urls = [...pageUrls, ...postUrls];
    const sitemap = createSitemap(urls);
    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            "Cache-Control": new CacheControl("swr").toString() 
        },
    });
};