import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import ProjectCard from './ProjectCard'

export default async function Books({ lang }: { lang: string }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const books = await microCMS.listBooks()

  if (books.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="md:border-l md:pl-6 [border-color:var(--rvt-border)]">
        <div className="flex max-w-3xl flex-col space-y-16">
          {books.map((book) => (
            <ProjectCard key={book.id} project={book} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  )
}
