import Image from 'next/image'
import Profile from '@/components/content/Profile'
import SocialLink from '@/components/tailwindui/SocialLink'
import TwitterIcon from '@/components/tailwindui/SocialIcons/Twitter'
import GitHubIcon from '@/components/tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '@/components/tailwindui/SocialIcons/LinkedIn'

function OuterContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:px-8">
      <div className="mx-auto max-w-7xl lg:px-8">{children}</div>
    </div>
  )
}

export default function Hero({ lang }: { lang: string }) {
  return (
    <OuterContainer>
      <div className="relative px-4 sm:px-8 lg:px-12">
        <div className="mt-9 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1>
              <span className="block text-sm font-semibold uppercase tracking-wide text-zinc-800 dark:text-zinc-100 sm:text-base lg:text-sm xl:text-base"></span>
              <span className="mt-1 block text-3xl tracking-tight font-extrabold sm:text-4xl xl:text-5xl">
                <span className="block text-zinc-800 dark:text-zinc-100">Hello!</span>
                <span className="block text-zinc-800 dark:text-zinc-100">
                  I&apos;m <span className="text-indigo-600">Hidetaka Okamoto</span>
                </span>
              </span>
            </h1>
            <div className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
              <Profile lang={lang} />
            </div>
            <div className="mt-6 flex gap-6">
              <SocialLink
                href="https://twitter.com/hidetaka_dev"
                aria-label="Follow on Twitter"
                icon={TwitterIcon}
              >
                <span className="sr-only">Follow on Twitter</span>
              </SocialLink>
              <SocialLink
                href="https://github.com/hideokamoto"
                aria-label="Follow on GitHub"
                icon={GitHubIcon}
              >
                <span className="sr-only">Follow on GitHub</span>
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/in/hideokamoto/"
                aria-label="Follow on LinkedIn"
                icon={LinkedInIcon}
              >
                <span className="sr-only">Follow on LinkedIn</span>
              </SocialLink>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <button
                type="button"
                className="relative block w-full bg-white rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Watch our video to learn more</span>
                <Image className="w-full" src="/images/profile.jpg" alt="Profile image" width={800} height={800} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </OuterContainer>
  )
}
