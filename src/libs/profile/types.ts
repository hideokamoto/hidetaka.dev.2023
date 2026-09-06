/**
 * Shape of the profile data consumed from profile-as-a-service.
 *
 * The wire format is a Schema.org `Person` JSON-LD document served as a static
 * artifact at `<base>/p/<id>/<lang>/profile.jsonld`. This module's types describe the
 * *parsed* form the site renders from — see `parsePerson.ts` for the boundary.
 */

/** Social networks this site renders a dedicated icon for. Anything else is `other`. */
export type ProfileSocialNetwork = 'twitter' | 'github' | 'linkedin' | 'other'

export type ProfileSocialLink = {
  network: ProfileSocialNetwork
  url: string
}

export type ProfileOrganization = {
  name: string
  url?: string
}

/**
 * The site-facing profile. Only `name` is guaranteed: the upstream JSON Resume schema
 * makes every other field optional, so each consumer decides what to do when one is absent
 * rather than the parser inventing a value.
 */
export type Profile = {
  name: string
  jobTitle?: string
  description?: string
  image?: string
  url?: string
  /** Every `sameAs` URL in source order, including ones with no recognised network. */
  sameAs: string[]
  /** `sameAs` classified by network, for rendering icon links. */
  social: ProfileSocialLink[]
  worksFor?: ProfileOrganization
  knowsAbout: string[]
  awards: string[]
}

export type ProfileLang = 'ja' | 'en'
