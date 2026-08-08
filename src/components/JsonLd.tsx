type JsonLdProps = {
  data: Record<string, unknown>
}

/**
 * `</script`（大文字小文字を問わず）をUnicodeエスケープし、埋め込んだJSONが
 * script要素を早期に閉じられないようにする。全ての `<` を潰す必要はなく、
 * script終了タグを構成できなくすれば十分。
 *
 * 例えば description が外部（profile-as-a-service）から来る値の場合、
 * そこに `</script><script>...` のような文字列が混入していても安全に埋め込める。
 */
function toSafeJsonLdString(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/<\/script/gi, '<\\/script')
}

/**
 * JSON-LD構造化データを描画するコンポーネント
 * dangerouslySetInnerHTMLの使用を1箇所に集約
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: toSafeJsonLdString escapes </script>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toSafeJsonLdString(data) }}
    />
  )
}
