import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { MicroCMSAPI } from '../../libs/microCMS/apis';
import { createCFMicroCMSClient } from '../../libs/microCMS/cloudflare';

export async function get(context: APIContext) {
    const microCMS = new MicroCMSAPI(createCFMicroCMSClient(context.request))
    
    const books = await microCMS.listBooks()
    const items = [
        ...books.map(book => {
            return {
                link: book.url,
                title: book.title,
                pubDate: new Date(book.published_at as string),
            }
        })
    ] .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
	return rss({
		title: "Recent projects | Hidetaka Okamoto",
		description: "Recent books, projects, etc..",
		site: context.site?.origin ?? '',
        items: items
	});
}
