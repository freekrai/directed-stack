import type {DataFunctionArgs} from '@vercel/remix'
import { add, parseISO, format } from 'date-fns';
import {getDomainUrl} from '~/utils/'

import { readByQuery } from '~/services/directus.server';

function cdata(s: string) {
  return `<![CDATA[${s}]]>`
}

export const loader = async ({request}: DataFunctionArgs) => {
    const blogUrl = `${getDomainUrl(request)}/blog`

    const posts = await readByQuery("posts", {
        filter: {
			status: {
				'_eq': 'published'
			}
        },
        offset: 0,
        limit: 10,
        fields: ["*.*"],
        sort: "-published",
    });

    const rss = `
        <rss xmlns:blogChannel="${blogUrl}" version="2.0">
        <channel>
            <title>Roger Stringer</title>
            <link>${blogUrl}</link>
            <description>Roger Stringer</description>
            <language>en-us</language>
            <generator>Remix</generator>
            <ttl>40</ttl>
            ${posts.map(post =>
                `
                <item>
                <title>${cdata(post.title ?? 'Untitled Post')}</title>
                <description>${cdata(
                    post.excerpt ?? 'This post is... indescribable',
                )}</description>
                <pubDate>${format(
                    add(
                    post.date
                        ? parseISO(post.date)
                        : Date.now(),
                    {minutes: new Date().getTimezoneOffset()},
                    ),
                    'yyyy-MM-ii',
                )}</pubDate>
                <link>${blogUrl}/${post.slug}</link>
                <guid>${blogUrl}/${post.slug}</guid>
                </item>
            `.trim(),
            )
            .join('\n')}
        </channel>
        </rss>
    `.trim()

    return new Response(rss, {
        headers: {
        'Content-Type': 'application/xml',
        'Content-Length': String(Buffer.byteLength(rss)),
        },
    })
}