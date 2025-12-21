/**
 * リダイレクトルールのインターフェース
 * 純粋関数として実装され、テスト可能な設計
 */
export interface RedirectRule {
  /**
   * 指定されたパスがリダイレクト対象かどうかを判定する
   * @param pathname チェックするパス
   * @returns リダイレクトが必要な場合true
   */
  shouldRedirect(pathname: string): boolean

  /**
   * リダイレクト先のURLを取得する
   * @param pathname 元のパス
   * @param baseUrl ベースURL（例: https://hidetaka.dev）
   * @returns リダイレクト先の完全なURL
   */
  getRedirectPath(pathname: string, baseUrl: string): string
}

/**
 * レガシーパスを新しいパスにリダイレクトするルール
 * 例: /projects → /work
 */
export class LegacyPathRedirectRule implements RedirectRule {
  constructor(
    private readonly oldPath: string,
    private readonly newPath: string,
  ) {}

  shouldRedirect(pathname: string): boolean {
    return pathname === this.oldPath || pathname.startsWith(`${this.oldPath}/`)
  }

  getRedirectPath(pathname: string, baseUrl: string): string {
    const newPathname = pathname.replace(this.oldPath, this.newPath)
    return `${baseUrl}${newPathname}`
  }
}

/**
 * dev-notesパスを除外したリダイレクトルール
 * /writing/[id] → /news/ のリダイレクトで、dev-notesは除外する
 */
export class DevNotesExclusionRedirectRule implements RedirectRule {
  constructor(
    private readonly sourcePath: string,
    private readonly targetPath: string,
  ) {}

  shouldRedirect(pathname: string): boolean {
    // ソースパス自体はリダイレクトしない
    if (pathname === this.sourcePath) {
      return false
    }

    // dev-notesパスはリダイレクトしない
    const devNotesPath = `${this.sourcePath}dev-notes/`
    if (pathname.startsWith(devNotesPath)) {
      return false
    }

    // それ以外のソースパス配下はリダイレクトする
    return pathname.startsWith(this.sourcePath)
  }

  getRedirectPath(_pathname: string, baseUrl: string): string {
    return `${baseUrl}${this.targetPath}`
  }
}

/**
 * リダイレクトルールエンジン
 * 複数のルールを管理し、リダイレクトが必要かどうかを判定する
 */
export class RedirectRuleEngine {
  constructor(private readonly rules: RedirectRule[]) {}

  /**
   * 指定されたパスがリダイレクト対象かどうかを判定する
   * @param pathname チェックするパス
   * @param baseUrl ベースURL
   * @returns リダイレクトが必要な場合true
   */
  shouldRedirect(pathname: string, _baseUrl: string): boolean {
    return this.rules.some((rule) => rule.shouldRedirect(pathname))
  }

  /**
   * リダイレクト先のURLを取得する
   * 最初にマッチしたルールのリダイレクト先を返す
   * @param pathname 元のパス
   * @param baseUrl ベースURL
   * @returns リダイレクト先の完全なURL
   */
  getRedirectPath(pathname: string, baseUrl: string): string {
    const matchingRule = this.rules.find((rule) => rule.shouldRedirect(pathname))
    if (!matchingRule) {
      throw new Error(`No matching rule found for pathname: ${pathname}`)
    }
    return matchingRule.getRedirectPath(pathname, baseUrl)
  }
}

/**
 * アプリケーションで使用するリダイレクトルールのファクトリー関数
 * すべてのリダイレクトルールを設定して返す
 */
export function createRedirectRules(): RedirectRule[] {
  return [
    // レガシーパスのリダイレクト
    new LegacyPathRedirectRule('/projects', '/work'),
    new LegacyPathRedirectRule('/ja/projects', '/ja/work'),
    new LegacyPathRedirectRule('/oss', '/work'),
    new LegacyPathRedirectRule('/ja/oss', '/ja/work'),
    new LegacyPathRedirectRule('/articles', '/writing'),
    new LegacyPathRedirectRule('/ja/articles', '/ja/writing'),

    // microCMS posts API廃止に伴う移行（dev-notesは除外）
    new DevNotesExclusionRedirectRule('/writing/', '/news/'),
    new DevNotesExclusionRedirectRule('/ja/writing/', '/ja/news/'),
  ]
}
