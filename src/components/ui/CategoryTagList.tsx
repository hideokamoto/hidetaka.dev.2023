import Link from 'next/link'
import Tag from '@/components/ui/Tag'

export interface Category {
  id: number
  name: string
  slug: string
}

interface CategoryTagListProps {
  categories: Category[]
  basePath: string
  className?: string
}

export default function CategoryTagList({
  categories,
  basePath,
  className = '',
}: CategoryTagListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => {
        let normalizedSlug = category.slug
        try {
          normalizedSlug = category.slug.includes('%')
            ? decodeURIComponent(category.slug)
            : category.slug
        } catch {
          // Malformed percent-encoding — fall back to original slug
        }
        const categoryUrl = `${basePath}/category/${encodeURIComponent(normalizedSlug)}`
        return (
          <Link key={category.id} href={categoryUrl}>
            <Tag
              variant="indigo"
              size="sm"
              className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              {category.name}
            </Tag>
          </Link>
        )
      })}
    </div>
  )
}
