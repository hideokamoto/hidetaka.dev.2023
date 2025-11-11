import { MicroCMSAPI } from '@/lib/microCMS/apis'
import { createMicroCMSClient } from '@/lib/microCMS/client'
import ProjectCard from './ProjectCard'

export default async function Books({ lang }: { lang: string }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const books = await microCMS.listBooks()

  if (books.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {books.map((book) => (
            <ProjectCard key={book.id} project={book} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  )
}

