import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useDialogA11y } from './useDialogA11y'

function TestDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose)

  if (!isOpen) return null

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Test dialog">
      <button type="button">First</button>
      <button type="button">Second</button>
      <button type="button">Last</button>
    </div>
  )
}

function TestApp() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Toggle
      </button>
      <TestDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

describe('useDialogA11y', () => {
  it('開時に最初のフォーカス可能要素へフォーカスを移動する', () => {
    render(<TestApp />)
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
  })

  it('Escape キーで onClose を呼び出す', () => {
    const onClose = vi.fn()
    render(<TestDialog isOpen={true} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('閉じている間はキーボードイベントを処理しない', () => {
    const onClose = vi.fn()
    render(<TestDialog isOpen={false} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('Tab で最後の要素から最初の要素へフォーカスをラップする', () => {
    render(<TestDialog isOpen={true} onClose={() => {}} />)

    screen.getByRole('button', { name: 'Last' }).focus()
    fireEvent.keyDown(document, { key: 'Tab' })

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
  })

  it('Shift+Tab で最初の要素から最後の要素へフォーカスをラップする', () => {
    render(<TestDialog isOpen={true} onClose={() => {}} />)

    screen.getByRole('button', { name: 'First' }).focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus()
  })

  it('閉時に開く前にフォーカスされていた要素へフォーカスを復元する', () => {
    render(<TestApp />)
    const toggle = screen.getByRole('button', { name: 'Toggle' })

    toggle.focus()
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(toggle).toHaveFocus()
  })
})
