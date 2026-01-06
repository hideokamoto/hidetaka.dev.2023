/**
 * classNameを結合するユーティリティ関数
 * clsxのシンプルな代替実装
 * 空文字列やundefinedを適切に処理
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
