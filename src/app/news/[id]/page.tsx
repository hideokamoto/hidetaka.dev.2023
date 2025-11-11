import { MicroCMSAPI } from '@/lib/microCMS/apis'
import { createMicroCMSClient } from '@/lib/microCMS/client'
import Container from '@/components/tailwindui/Container'

export async function generateStaticParams() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const posts = await microCMS.listPosts({ lang: 'japanese' })
  return posts.map((post) => ({
    id: post.id,
  }))
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const post = await microCMS.getPost(params.id)

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <Container className="mt-16 sm:mt-32">
      <article>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
          {post.title}
        </h1>
        <div 
          className="mt-6 prose prose-zinc dark:prose-invert" 
          dangerouslySetInnerHTML={{ __html: typeof post.content === 'string' ? post.content : String(post.content || '') }} 
        />
      </article>
    </Container>
  )
}

