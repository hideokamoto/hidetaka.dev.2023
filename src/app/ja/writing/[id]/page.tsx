import Container from '@/components/tailwindui/Container'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

// See REVALIDATION_PERIOD.ARTICLE in @/consts
export const revalidate = 86400

export async function generateStaticParams() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const posts = await microCMS.listPosts({ lang: 'japanese' })
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
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted microCMS, controlled by site owner
          dangerouslySetInnerHTML={{
            __html: typeof post.content === 'string' ? post.content : String(post.content || ''),
          }}
        />
      </article>
    </Container>
  )
}
