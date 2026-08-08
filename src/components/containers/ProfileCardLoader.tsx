'use client'

import { useEffect, useState } from 'react'
import ProfileCard from '@/components/ui/ProfileCard'
import { profileFallback } from '@/libs/profile/fallback'
import { loadProfile } from '@/libs/profile/loadProfile'
import type { Profile, ProfileLang } from '@/libs/profile/types'

type ProfileCardLoaderProps = {
  lang: ProfileLang
  showImage?: boolean
  showSocial?: boolean
  className?: string
  imageSrc?: string
  imageSize?: 'sm' | 'md' | 'lg' | 'responsive'
}

/**
 * Client-side loader for the profile card.
 *
 * The card is decoration on the pages that use it (article sidebars) — never the page's own
 * subject — so it is fetched in the browser rather than threaded through every page and
 * container. Two things follow from that, and both are the point:
 *
 * 1. The browser reads the CDN directly, so a `publish` from the admin SPA is visible as soon
 *    as CloudFront's cache turns over. Nothing has to be redeployed or revalidated here.
 * 2. No prop drilling: every call site just drops this component in.
 *
 * This deliberately does NOT apply to the Person JSON-LD or to the About page's own bio —
 * those are indexable content and are rendered on the server.
 *
 * Rendering starts from the static fallback rather than a skeleton: the card is fully
 * readable on first paint, occupies its final height (no layout shift), and swaps in the
 * upstream copy once it arrives.
 */
export default function ProfileCardLoader({ lang, ...cardProps }: ProfileCardLoaderProps) {
  // Tracks which language `profile` was resolved for. `useState`'s lazy initializer only runs
  // on mount, so without this a `lang` prop change on an already-mounted instance would keep
  // showing the previous language's content until the new fetch resolves.
  const [state, setState] = useState<{ lang: ProfileLang; profile: Profile }>(() => ({
    lang,
    profile: profileFallback(lang),
  }))

  useEffect(() => {
    let active = true

    // `loadProfile` resolves to the fallback on every failure path, so there is no rejection
    // to handle here — a failed load simply leaves the card on the copy it already shows.
    loadProfile(lang).then((loaded) => {
      if (active) setState({ lang, profile: loaded })
    })

    return () => {
      active = false
    }
  }, [lang])

  // Render fallback synchronously the instant `lang` changes, rather than waiting a render
  // cycle for the effect above to notice — `state.lang` mismatching the prop is exactly that
  // one-render window.
  const profile = state.lang === lang ? state.profile : profileFallback(lang)

  return <ProfileCard profile={profile} {...cardProps} />
}
