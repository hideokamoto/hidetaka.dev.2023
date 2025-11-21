import Container from '@/components/tailwindui/Container'
import { InArticleAd } from '@/components/ui/GoogleAds'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

export async function generateStaticParams() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const posts = await microCMS.listPosts({ lang: 'english' })
  return posts.map((post) => ({
    id: post.id,
  }))
}

export default async function WritingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const post = await microCMS.getPost(id)

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
          dangerouslySetInnerHTML={{
            __html: typeof post.content === 'string' ? post.content : String(post.content || ''),
          }}
        />

        {/* In-Article Ad */}
        <InArticleAd />
      </article>
    </Container>
  )
}
