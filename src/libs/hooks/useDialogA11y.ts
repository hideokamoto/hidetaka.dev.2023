'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * ダイアログ内のフォーカス可能な要素を取得する。
 *
 * @param container - 検索対象のコンテナ要素
 * @returns フォーカス可能な要素の配列(コンテナが無い場合は空配列)
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

/**
 * モーダルダイアログのアクセシビリティ挙動を提供するフック。
 *
 * - 開時: 直前のフォーカス要素を記憶し、ダイアログ内の最初のフォーカス可能要素へフォーカスを移動する
 * - 開いている間: Tab / Shift+Tab のフォーカスをダイアログ内でラップ(フォーカストラップ)する
 * - Escape キーで `onClose` を呼び出す
 * - 閉時(アンマウント/`isOpen` が false になった時): 開く前にフォーカスされていた要素へフォーカスを復元する
 *
 * 返り値の ref をダイアログのパネル要素(`role="dialog"` を付与した要素)に設定して使用する。
 *
 * @param isOpen - ダイアログが開いているかどうか
 * @param onClose - ダイアログを閉じることを要求する際に呼び出されるコールバック
 * @returns ダイアログパネル要素に設定する ref
 */
export function useDialogA11y<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose: () => void,
) {
  const dialogRef = useRef<T>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    // 開時に最初のフォーカス可能要素へフォーカスを移動
    const focusables = getFocusableElements(dialogRef.current)
    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      dialogRef.current?.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const elements = getFocusableElements(dialogRef.current)
      if (elements.length === 0) {
        event.preventDefault()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement
      const isInside = active instanceof HTMLElement && dialogRef.current?.contains(active)

      if (event.shiftKey) {
        if (!isInside || active === first) {
          event.preventDefault()
          last.focus()
        }
      } else if (!isInside || active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // 閉時にトグルボタンなど元の要素へフォーカスを復元
      previousFocus?.focus()
    }
  }, [isOpen])

  return dialogRef
}
