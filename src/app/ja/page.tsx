import Container from '@/components/tailwindui/Container'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import BlogPosts from '@/components/BlogPosts/BlogPosts'
import Resume from '@/components/Resume'
import Hero from '@/components/Hero/Hero'

export default async function HomePage() {
  const lang = 'ja'
  const posts = await loadBlogPosts('ja')

  return (
    <>
      <Hero lang={lang} />
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <BlogPosts lang={lang} posts={posts} />
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Resume />
          </div>
        </div>
      </Container>
    </>
  )
}

