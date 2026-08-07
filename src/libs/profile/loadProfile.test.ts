import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { profileFallback } from './fallback'
import { buildProfileUrl, loadProfile } from './loadProfile'

const BASE = 'https://example.cloudfront.net'

const PERSON = {
  '@type': 'Person',
  name: '岡本 秀高',
  jobTitle: 'シニアフィールドエンジニア',
  description: 'アップストリーム由来の紹介文',
  sameAs: ['https://github.com/hideokamoto'],
}

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  } as Response
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_PROFILE_BASE_URL', BASE)
  vi.stubEnv('NEXT_PUBLIC_PROFILE_ID', 'hidetaka')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('buildProfileUrl', () => {
  it('composes the language-scoped artifact path', () => {
    expect(buildProfileUrl(BASE, 'hidetaka', 'ja')).toBe(`${BASE}/p/hidetaka/ja/profile.jsonld`)
    expect(buildProfileUrl(BASE, 'hidetaka', 'en')).toBe(`${BASE}/p/hidetaka/en/profile.jsonld`)
  })

  it('tolerates a trailing slash on the configured base URL', () => {
    expect(buildProfileUrl(`${BASE}/`, 'hidetaka', 'ja')).toBe(
      `${BASE}/p/hidetaka/ja/profile.jsonld`,
    )
    expect(buildProfileUrl(`${BASE}///`, 'hidetaka', 'ja')).toBe(
      `${BASE}/p/hidetaka/ja/profile.jsonld`,
    )
  })
})

describe('loadProfile', () => {
  it('returns the upstream profile when the fetch succeeds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(PERSON))
    vi.stubGlobal('fetch', fetchMock)

    const profile = await loadProfile('ja')

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE}/p/hidetaka/ja/profile.jsonld`)
    expect(profile.name).toBe('岡本 秀高')
    expect(profile.description).toBe('アップストリーム由来の紹介文')
  })

  it('falls back without fetching when no base URL is configured', async () => {
    // Keeps the integration inert until the service is actually reachable, instead of
    // firing a request at a URL that does not exist yet.
    vi.stubEnv('NEXT_PUBLIC_PROFILE_BASE_URL', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const profile = await loadProfile('ja')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(profile).toEqual(profileFallback('ja'))
  })

  it('falls back when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false)))

    expect(await loadProfile('en')).toEqual(profileFallback('en'))
  })

  it('falls back when the network request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    expect(await loadProfile('ja')).toEqual(profileFallback('ja'))
  })

  it('falls back when the body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token')
        },
      } as unknown as Response),
    )

    expect(await loadProfile('ja')).toEqual(profileFallback('ja'))
  })

  it('falls back when the document parses but is not a usable Person', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ '@type': 'Organization' })))

    expect(await loadProfile('en')).toEqual(profileFallback('en'))
  })

  it('surfaces the failure to logs rather than failing silently', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await loadProfile('ja')

    expect(warn).toHaveBeenCalled()
  })
})
