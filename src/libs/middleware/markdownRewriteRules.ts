/**
 * Markdownリライトの結果
 */
export interface MarkdownRewriteResult {
  /** リライト先のパス名 */
  pathname: string
  /** クエリパラメータ（必要な場合のみ） */
  searchParams?: Record<string, string>
}

/**
 * Markdownリライトルールのインターフェース
 * 純粋関数として実装され、テスト可能な設計
 */
export interface MarkdownRewriteRule {
  /**
   * 指定されたパスがこのルールにマッチするかどうかを判定する
   * @param pathname チェックするパス
   * @returns マッチする場合true
   */
  matches(pathname: string): boolean

  /**
   * リライト先のパスとクエリパラメータを取得する
   * @param pathname 元のパス
   * @returns リライト先のパスとクエリパラメータ
   */
  getRewritePath(pathname: string): MarkdownRewriteResult
}

/**
 * 正規表現ベースのMarkdownリライトルール
 * パターンマッチングとキャプチャグループを使用してリライトパスを生成
 */
export class RegexMarkdownRewriteRule implements MarkdownRewriteRule {
  private readonly pattern: RegExp

  constructor(
    pattern: RegExp,
    private readonly rewritePathTemplate: string,
    private readonly extractLang: boolean = false,
  ) {
    this.pattern = pattern
  }

  matches(pathname: string): boolean {
    return this.pattern.test(pathname)
  }

  getRewritePath(pathname: string): MarkdownRewriteResult {
    const match = pathname.match(this.pattern)
    if (!match) {
      throw new Error(`Pattern did not match pathname: ${pathname}`)
    }

    // キャプチャグループから値を取得
    const [, langPrefix, slug] = match

    // リライトパスを生成（slugを埋め込む）
    const rewritePath = this.rewritePathTemplate.replace('{slug}', slug)

    // 言語プレフィックスがある場合はクエリパラメータに追加
    if (this.extractLang && langPrefix) {
      return {
        pathname: rewritePath,
        searchParams: { lang: 'ja' },
      }
    }

    return {
      pathname: rewritePath,
    }
  }
}

/**
 * Markdownリライトルールエンジン
 * 複数のルールを管理し、リライトが必要かどうかを判定する
 */
export class MarkdownRewriteRuleEngine {
  constructor(private readonly rules: MarkdownRewriteRule[]) {}

  /**
   * 指定されたパスがリライト対象かどうかを判定する
   * @param pathname チェックするパス
   * @returns リライトが必要な場合true
   */
  shouldRewrite(pathname: string): boolean {
    return this.rules.some((rule) => rule.matches(pathname))
  }

  /**
   * リライト先のパスとクエリパラメータを取得する
   * 最初にマッチしたルールのリライト先を返す
   * @param pathname 元のパス
   * @returns リライト先のパスとクエリパラメータ
   */
  getRewritePath(pathname: string): MarkdownRewriteResult {
    const matchingRule = this.rules.find((rule) => rule.matches(pathname))
    if (!matchingRule) {
      throw new Error(`No matching rule found for pathname: ${pathname}`)
    }
    return matchingRule.getRewritePath(pathname)
  }
}

/**
 * アプリケーションで使用するMarkdownリライトルールのファクトリー関数
 * すべてのリライトルールを設定して返す
 */
export function createMarkdownRewriteRules(): MarkdownRewriteRule[] {
  return [
    // /blog/<slug>.md または /ja/blog/<slug>.md → /api/markdown/blog/{slug}
    new RegexMarkdownRewriteRule(
      /^(\/ja)?\/blog\/(.+)\.md$/,
      '/api/markdown/blog/{slug}',
      true, // 言語プレフィックスを抽出
    ),

    // /writing/dev-notes/<slug>.md または /ja/writing/dev-notes/<slug>.md → /api/markdown/dev-notes/{slug}
    new RegexMarkdownRewriteRule(
      /^(?:\/ja)?\/writing\/dev-notes\/(.+)\.md$/,
      '/api/markdown/dev-notes/{slug}',
      false, // 言語プレフィックスは不要（非キャプチャグループのため）
    ),

    // /news/<slug>.md または /ja/news/<slug>.md → /api/markdown/news/{slug}
    new RegexMarkdownRewriteRule(
      /^(\/ja)?\/news\/(.+)\.md$/,
      '/api/markdown/news/{slug}',
      true, // 言語プレフィックスを抽出
    ),
  ]
}
