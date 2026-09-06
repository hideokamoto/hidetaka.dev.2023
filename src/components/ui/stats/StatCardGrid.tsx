export type StatCardItem = {
  /** 指標名 */
  label: string
  /** 表示する値（整形済みの文字列） */
  value: string
  /** 補足（出典や内訳） */
  hint?: string
}

/** 列レイアウト。`'2/3'` は sm で2列・lg で3列（カード数が多いとき向け）。 */
export type StatCardColumns = 2 | 3 | '2/3'

interface Props {
  items: StatCardItem[]
  /** 列レイアウト。既定は 3。 */
  columns?: StatCardColumns
  className?: string
}

// Tailwind の JIT が拾えるよう、クラス名は完全な文字列で保持する。
const COLUMN_CLASSES: Record<StatCardColumns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  '2/3': 'sm:grid-cols-2 lg:grid-cols-3',
}

/**
 * 数値ハイライトのカードグリッド。
 * 値の整形（単位・桁区切り・i18n）は呼び出し側の責務。
 */
export default function StatCardGrid({ items, columns = 3, className = '' }: Props) {
  if (items.length === 0) return null

  return (
    <dl className={`grid grid-cols-1 gap-4 ${COLUMN_CLASSES[columns]} ${className}`.trim()}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl p-6 text-center"
          style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
        >
          <dt className="text-sm font-medium" style={{ color: 'var(--rvt-fg2)' }}>
            {item.label}
          </dt>
          <dd
            className="mt-2 text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--rvt-accent)' }}
          >
            {item.value}
          </dd>
          {item.hint && (
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--rvt-fg3)' }}>
              {item.hint}
            </p>
          )}
        </div>
      ))}
    </dl>
  )
}
