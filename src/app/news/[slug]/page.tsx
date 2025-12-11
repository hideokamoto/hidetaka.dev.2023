import { notFound } from 'next/navigation'
import Container from '@/components/tailwindui/Container'
import { getProductBySlug, loadAllProducts } from '@/libs/dataSources/products'

export async function generateStaticParams() {
  const products = await loadAllProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug, 'en')

  if (!product) {
    return {
      title: 'Product News',
    }
  }

  return {
    title: product.title.rendered,
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug, 'en')

  if (!product) {
    notFound()
  }

  return (
    <Container className="mt-16 sm:mt-32">
      <article>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
          {product.title.rendered}
        </h1>
        <time
          dateTime={product.date}
          className="mt-4 flex items-center text-sm text-zinc-500 dark:text-zinc-400"
        >
          {new Date(product.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <div
          className="mt-8 prose prose-zinc dark:prose-invert max-w-none"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress API, controlled by site owner
          dangerouslySetInnerHTML={{
            __html: product.content.rendered,
          }}
        />
      </article>
    </Container>
  )
}
