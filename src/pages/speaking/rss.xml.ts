

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { listUpcomingEvents } from '../../libs/microCMS/apis';

export async function get(context: APIContext) {
    const events = await listUpcomingEvents()
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
