import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import ProjectCard from './ProjectCard'

export default async function Applications({ lang }: { lang: string }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const apps = await microCMS.listApps()

  if (apps.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="md:border-l md:pl-6 [border-color:var(--rvt-border)]">
        <div className="flex max-w-3xl flex-col space-y-16">
          {apps.map((app) => (
            <ProjectCard key={app.id} project={app} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  )
}
