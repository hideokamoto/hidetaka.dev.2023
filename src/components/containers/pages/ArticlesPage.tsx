import Container from '@/components/tailwindui/Container'
import SimpleLayout from '@/components/tailwindui/SimpleLayout'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import BlogPosts from '@/components/BlogPosts/BlogPosts'

export default async function ArticlesPageContent({ lang }: { lang: string }) {
  const { items: posts } = await loadBlogPosts(lang === 'ja' ? 'ja' : 'en')
  const title = lang === 'ja' ? '記事' : 'Articles'

  return (
    <SimpleLayout title={title}>
      <BlogPosts lang={lang} posts={posts} />
    </SimpleLayout>
  )
}

