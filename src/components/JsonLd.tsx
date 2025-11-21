type JsonLdProps = {
  data: Record<string, unknown>
}

/**
 * JSON-LD構造化データを描画するコンポーネント
 * dangerouslySetInnerHTMLの使用を1箇所に集約
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage - JSON.stringify output for structured data
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}
