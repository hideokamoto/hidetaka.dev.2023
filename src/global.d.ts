/**
 * Chrome Translator API の型定義
 * @see https://github.com/WICG/translation-api
 */

/**
 * Translator 作成オプション
 */
interface TranslatorCreateOptions {
  sourceLanguage: string
  targetLanguage: string
  signal?: AbortSignal
}

/**
 * Translator 可用性オプション
 */
interface TranslatorAvailabilityOptions {
  sourceLanguage: string
  targetLanguage: string
}

/**
 * 翻訳オプション
 */
interface TranslateOptions {
  signal?: AbortSignal
}

/**
 * Translator インスタンス
 */
interface Translator {
  /**
   * テキストを翻訳する
   * @param text 翻訳対象のテキスト
   * @param options 翻訳オプション
   * @returns 翻訳されたテキスト
   */
  translate(text: string, options?: TranslateOptions): Promise<string>

  /**
   * Translator インスタンスを破棄する
   */
  destroy(): void
}

/**
 * Translator コンストラクタ
 */
interface TranslatorConstructor {
  /**
   * Translator インスタンスを作成する
   * @param options Translator 作成オプション
   * @returns Translator インスタンス
   * @throws NotAllowedError - パーミッションが拒否された場合
   * @throws QuotaExceededError - 翻訳クォータを超過した場合
   * @throws AbortError - 作成がキャンセルされた場合
   */
  create(options: TranslatorCreateOptions): Promise<Translator>

  /**
   * Translator の利用可能状態を確認する
   * @param options 可用性チェックオプション
   * @returns 'available' | 'downloadable' | 'downloading' | 'unavailable'
   */
  availability(options: TranslatorAvailabilityOptions): Promise<string>
}

/**
 * Summarizer API の型定義
 */

/**
 * Summarizer 作成オプション
 */
interface SummarizerCreateOptions {
  type?: 'tldr' | 'key-points' | 'teaser' | 'headline'
  format?: 'plain-text' | 'markdown'
  length?: 'short' | 'medium' | 'long'
  outputLanguage?: string
  signal?: AbortSignal
}

/**
 * Summarizer 可用性オプション
 */
interface SummarizerAvailabilityOptions {
  type?: 'tldr' | 'key-points' | 'teaser' | 'headline'
  format?: 'plain-text' | 'markdown'
  length?: 'short' | 'medium' | 'long'
  outputLanguage?: string
}

/**
 * Summarizer インスタンス
 */
interface Summarizer {
  /**
   * テキストを要約する
   * @param text 要約対象のテキスト
   * @returns 要約されたテキスト
   */
  summarize(text: string): Promise<string>

  /**
   * テキストをストリーミングで要約する
   * @param text 要約対象のテキスト
   * @returns ストリーム
   */
  summarizeStreaming(text: string): ReadableStream<string>

  /**
   * Summarizer インスタンスを破棄する
   */
  destroy(): void
}

/**
 * Summarizer コンストラクタ
 */
interface SummarizerConstructor {
  /**
   * Summarizer インスタンスを作成する
   * @param options Summarizer 作成オプション
   * @returns Summarizer インスタンス
   */
  create(options?: SummarizerCreateOptions): Promise<Summarizer>

  /**
   * Summarizer の利用可能状態を確認する
   * @param options 可用性チェックオプション
   * @returns 'available' | 'downloadable' | 'downloading' | 'unavailable'
   */
  availability(options?: SummarizerAvailabilityOptions): Promise<string>
}

/**
 * Window インターフェースの拡張
 */
interface Window {
  /**
   * Chrome Translator API
   */
  Translator: TranslatorConstructor

  /**
   * Chrome Summarizer API
   */
  Summarizer: SummarizerConstructor
}

/**
 * グローバルスコープでの Translator の宣言
 */
declare const Translator: TranslatorConstructor

/**
 * グローバルスコープでの Summarizer の宣言
 */
declare const Summarizer: SummarizerConstructor
