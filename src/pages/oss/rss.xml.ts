import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { listMyNPMPackages } from '../../libs/dataSources/npmjs';
import { listMyWordPressPlugins } from '../../libs/dataSources/wporg';

export async function get(context: APIContext) {
    const npmPackages = await listMyNPMPackages()
    const wpPlugins = await listMyWordPressPlugins()
    const items = [
        ...npmPackages.map(({package: pkg}) => {
            return {
                link: pkg.links.npm,
                title: pkg.name,
                pubDate: new Date(pkg.date)
            }
        }),
        ...wpPlugins.map(plugin => {
            return {
                link: `https://wordpress.org/plugins/${plugin.slug}`,
                title: plugin.name,
                pubDate: new Date(plugin.added)
            }
        })
    ] .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
	return rss({
		title: "Recent OSS activities | Hidetaka Okamoto",
		description: "Recent OSS activities",
		site: context.site?.origin ?? '',
        items: items
	});
}
