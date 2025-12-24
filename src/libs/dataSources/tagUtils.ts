/**
 * 技術タグを抽出するユーティリティ関数
 * 記事のタイトルや説明から技術キーワードを検出してタグを生成
 */

export type TechTag = {
  name: string
  slug: string
  color: string
}

// 技術タグの定義（優先順位順）
const TECH_TAGS: TechTag[] = [
  { name: 'Stripe', slug: 'stripe', color: 'purple' },
  { name: 'AWS', slug: 'aws', color: 'orange' },
  { name: 'Serverless', slug: 'serverless', color: 'blue' },
  { name: 'WordPress', slug: 'wordpress', color: 'indigo' },
  { name: 'TypeScript', slug: 'typescript', color: 'blue' },
  { name: 'React', slug: 'react', color: 'cyan' },
  { name: 'Next.js', slug: 'nextjs', color: 'slate' },
  { name: 'Node.js', slug: 'nodejs', color: 'green' },
  { name: 'JavaScript', slug: 'javascript', color: 'yellow' },
  { name: 'Python', slug: 'python', color: 'blue' },
  { name: 'PHP', slug: 'php', color: 'indigo' },
  { name: 'Cloudflare', slug: 'cloudflare', color: 'orange' },
  { name: 'Docker', slug: 'docker', color: 'blue' },
  { name: 'Kubernetes', slug: 'kubernetes', color: 'blue' },
  { name: 'GraphQL', slug: 'graphql', color: 'pink' },
  { name: 'REST API', slug: 'rest-api', color: 'green' },
  { name: 'Microservices', slug: 'microservices', color: 'purple' },
  { name: 'CI/CD', slug: 'cicd', color: 'green' },
  { name: 'Git', slug: 'git', color: 'orange' },
  { name: 'TailwindCSS', slug: 'tailwindcss', color: 'cyan' },
]

/**
 * テキストから技術タグを抽出
 * @param text 検索対象のテキスト（タイトルや説明）
 * @returns マッチした技術タグの配列
 */
export function extractTechTags(text: string): TechTag[] {
  if (!text) return []

  const lowerText = text.toLowerCase()
  const matchedTags: TechTag[] = []

  for (const tag of TECH_TAGS) {
    // タグ名を小文字に変換して検索
    const tagNameLower = tag.name.toLowerCase()

    // 完全一致または単語境界での一致をチェック
    // 例: "Stripe" は "Stripe API" や "Stripe.js" にマッチするが、"striped" にはマッチしない
    const regex = new RegExp(`\\b${tagNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')

    if (regex.test(lowerText)) {
      matchedTags.push(tag)
    }
  }

  return matchedTags
}

/**
 * 複数のテキストから技術タグを抽出（重複を除去）
 * @param texts 検索対象のテキスト配列
 * @returns マッチした技術タグの配列（重複なし）
 */
export function extractTechTagsFromTexts(texts: string[]): TechTag[] {
  const allTags: TechTag[] = []
  const seenSlugs = new Set<string>()

  for (const text of texts) {
    const tags = extractTechTags(text)
    for (const tag of tags) {
      if (!seenSlugs.has(tag.slug)) {
        seenSlugs.add(tag.slug)
        allTags.push(tag)
      }
    }
  }

  return allTags
}
