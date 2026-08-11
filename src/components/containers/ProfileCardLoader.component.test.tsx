/**
 * ProfileCardLoader のテスト
 *
 * サーバーコンポーネントなので、関数を直接呼んで await した結果を render() に渡す。
 * このコンポーネントの設計上の主張は1つ:
 *   上流 profile-as-a-service の内容が届けばそれを描画し、届かなければ静的フォールバックに
 *   フェイルクローズする（loadProfile() の保証をそのまま透過する）。
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
  it('renders the upstream profile once fetched', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => UPSTREAM_PERSON }),
    )

    render(await ProfileCardLoader({ lang: 'ja' }))

    expect(screen.getByText('上流から来た名前')).toBeInTheDocument()
    expect(screen.getByText('上流から来た肩書き')).toBeInTheDocument()
    expect(screen.getByText('上流から来た紹介文')).toBeInTheDocument()
  })

  it('requests the artifact for the language it was given', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => UPSTREAM_PERSON })
    vi.stubGlobal('fetch', fetchMock)

    render(await ProfileCardLoader({ lang: 'en' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/p/hidetaka/en/profile.jsonld`,
        expect.anything(),
      )
    })
  })

  it('falls back to the static profile when the fetch fails', async () => {
    // 失敗しても空のカードにはしない — サイドバーが崩れるより古い情報のほうがまし。
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'))
    vi.stubGlobal('fetch', fetchMock)

    render(await ProfileCardLoader({ lang: 'ja' }))

    expect(screen.getByText(profileFallback('ja').name)).toBeInTheDocument()
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

    render(await ProfileCardLoader({ lang: 'ja' }))

    expect(screen.getByLabelText('Follow on GitHub')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /wp-kyoto/i })).not.toBeInTheDocument()
  })
})
