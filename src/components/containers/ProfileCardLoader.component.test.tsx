/**
 * ProfileCardLoader のテスト
 *
 * このコンポーネントの設計上の主張は2つあり、その両方を固定する:
 *   1. 初回ペイントで既に読める（スケルトンや空欄を挟まない = レイアウトシフトなし）
 *   2. 上流 profile-as-a-service の内容が届いたら差し替わる
 */

import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileCardLoader from '@/components/containers/ProfileCardLoader'
import { profileFallback } from '@/libs/profile/fallback'

const BASE = 'https://example.cloudfront.net'

const UPSTREAM_PERSON = {
  '@type': 'Person',
  name: '上流から来た名前',
  jobTitle: '上流から来た肩書き',
  description: '上流から来た紹介文',
  sameAs: ['https://github.com/hideokamoto'],
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_PROFILE_BASE_URL', BASE)
  vi.stubEnv('NEXT_PUBLIC_PROFILE_ID', 'hidetaka')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('ProfileCardLoader', () => {
  it('renders readable content on first paint, before the fetch resolves', () => {
    // never-settling fetch = 「まだ届いていない」状態を固定する
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    render(<ProfileCardLoader lang="ja" />)

    expect(screen.getByText(profileFallback('ja').name)).toBeInTheDocument()
  })

  it('swaps in the upstream profile once it arrives', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => UPSTREAM_PERSON }),
    )

    render(<ProfileCardLoader lang="ja" />)

    await waitFor(() => {
      expect(screen.getByText('上流から来た名前')).toBeInTheDocument()
    })
    expect(screen.getByText('上流から来た肩書き')).toBeInTheDocument()
    expect(screen.getByText('上流から来た紹介文')).toBeInTheDocument()
  })

  it('requests the artifact for the language it was given', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => UPSTREAM_PERSON })
    vi.stubGlobal('fetch', fetchMock)

    render(<ProfileCardLoader lang="en" />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/p/hidetaka/en/profile.jsonld`,
        expect.anything(),
      )
    })
  })

  it('keeps showing the fallback when the fetch fails', async () => {
    // 失敗しても空のカードにはしない — サイドバーが崩れるより古い情報のほうがまし。
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'))
    vi.stubGlobal('fetch', fetchMock)

    render(<ProfileCardLoader lang="ja" />)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(screen.getByText(profileFallback('ja').name)).toBeInTheDocument()
  })

  it('shows the new language fallback immediately on a lang change, never the old language', async () => {
    // A never-resolving fetch pins both renders in "still loading" — the assertion is about
    // what shows *before* any fetch resolves, i.e. whether the useState lazy initializer trap
    // (only runs on mount) leaks the previous language into the next one.
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    const { rerender } = render(<ProfileCardLoader lang="ja" />)
    expect(screen.getByText(profileFallback('ja').name)).toBeInTheDocument()

    rerender(<ProfileCardLoader lang="en" />)

    expect(screen.getByText(profileFallback('en').name)).toBeInTheDocument()
    expect(screen.queryByText(profileFallback('ja').name)).not.toBeInTheDocument()
  })

  it('renders only the networks that have an icon, dropping the rest', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          ...UPSTREAM_PERSON,
          sameAs: [
            'https://github.com/hideokamoto',
            'https://wp-kyoto.net/', // network: other → アイコンなし
          ],
        }),
      }),
    )

    render(<ProfileCardLoader lang="ja" />)

    await waitFor(() => {
      expect(screen.getByLabelText('Follow on GitHub')).toBeInTheDocument()
    })
    expect(screen.queryByRole('link', { name: /wp-kyoto/i })).not.toBeInTheDocument()
  })
})
