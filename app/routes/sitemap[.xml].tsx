import type {LoaderArgs} from '@vercel/remix'
import { createSitemap } from '~/utils/sitemap.server';
import {getDirectusClient, readByQuery} from '~/services/directus.server';
import { CacheControl } from "~/utils/cache-control.server";
import {getDomainUrl} from '~/utils/'

export const loader = async ({request}: LoaderArgs) => {

    const directus = await getDirectusClient();

    const blogUrl = `${getDomainUrl(request)}`

    // get all published pages
    const pages = await readByQuery("pages", {
        filter: {
			status: {
				'_eq': 'published'
			}
        },
        offset: 0,
        limit: -1,
        fields: ["*.*"],
    });

    // get all published posts
    const posts = await readByQuery("posts", {
        filter: {
			status: {
				'_eq': 'published'
			}
        },
        offset: 0,
        limit: -1,
        fields: ["*.*"],
    });

    const pageUrls = pages.map( page => {
        return {url: `${blogUrl}/${page.slug}`}
    }) || []

    const postUrls = posts.map( post => {
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