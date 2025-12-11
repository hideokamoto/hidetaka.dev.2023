import NewsPageContent from '@/components/containers/pages/NewsPage'
import { loadProducts } from '@/libs/dataSources/products'

export const metadata = {
  title: 'News',
}

// ISR: 30分ごとにページを再検証（製品ニュース更新）
export const revalidate = 1800

export default async function NewsPage() {
  const result = await loadProducts('en')

  return <NewsPageContent lang="en" products={result.items} />
}
