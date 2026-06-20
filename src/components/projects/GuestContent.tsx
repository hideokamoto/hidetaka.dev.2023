import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import ProjectCard from './ProjectCard'

export default async function GuestContent({ lang }: { lang: string }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const guestPosts = await microCMS.listGuestPosts()

  if (guestPosts.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="md:border-l md:pl-6 [border-color:var(--rvt-border)]">
        <div className="flex max-w-3xl flex-col space-y-16">
          {guestPosts.map((post) => (
            <ProjectCard key={post.id} project={post} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  )
}
