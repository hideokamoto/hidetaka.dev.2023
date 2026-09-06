import ProfileCard from '@/components/ui/ProfileCard'
import { loadProfileForRequest } from '@/libs/profile/loadProfile'
import type { ProfileLang } from '@/libs/profile/types'

type ProfileCardLoaderProps = {
  lang: ProfileLang
  showImage?: boolean
  showSocial?: boolean
  className?: string
  imageSrc?: string
  imageSize?: 'sm' | 'md' | 'lg' | 'responsive'
}

/**
 * Server-rendered loader for the profile card.
 *
 * Uses `loadProfileForRequest`, the same `React.cache()`-deduped loader the root layout's
 * Person JSON-LD and the About page's bio use. The root layout already fetches both languages
 * on every page, so a call here with a matching `lang` reuses that in-flight/resolved fetch
 * instead of issuing a new one — this component adds no fetches of its own.
 *
 * Falls back to the static profile on any failure (unconfigured, unreachable, non-2xx,
 * malformed body) — see `loadProfile()`'s doc comment for the fail-closed guarantees.
 */
export default async function ProfileCardLoader({ lang, ...cardProps }: ProfileCardLoaderProps) {
  const profile = await loadProfileForRequest(lang)
  return <ProfileCard profile={profile} {...cardProps} />
}
