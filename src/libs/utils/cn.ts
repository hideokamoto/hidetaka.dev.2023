/**
 * classNameを結合するユーティリティ関数
 * clsxのシンプルな代替実装
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
