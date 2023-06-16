

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { MicroCMSAPI } from '../../libs/microCMS/apis';
import { createCFMicroCMSClient } from '../../libs/microCMS/cloudflare';

export async function get(context: APIContext) {
    const microCMS = new MicroCMSAPI(createCFMicroCMSClient(context.request))
    const events = await microCMS.listUpcomingEvents()
	return rss({
		title: "Speaking schedule | Hidetaka Okamoto",
		description: "Upcoming event schedule that Hidetaka will talk at",
		site: context.site?.origin ?? '',
        items: events.map(event => {
            return {
                link: event.url,
                title: event.title,
                pubDate: new Date(event.publishedAt),
                description: event.description,
            }
        })
	});
}
