import BlogPosts from '@/components/BlogPosts/BlogPosts'
import SimpleLayout from '@/components/tailwindui/SimpleLayout'
import { loadBlogPosts } from '@/libs/dataSources/blogs'

export default async function ArticlesPageContent({ lang }: { lang: string }) {
  const { items: posts } = await loadBlogPosts(lang === 'ja' ? 'ja' : 'en')
  const title = lang === 'ja' ? '記事' : 'Articles'

  return (
    <SimpleLayout title={title}>
      <BlogPosts lang={lang} posts={posts} />
    </SimpleLayout>
  )
}
