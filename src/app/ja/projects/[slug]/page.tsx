import { MicroCMSAPI } from '@/lib/microCMS/apis'
import { createMicroCMSClient } from '@/lib/microCMS/client'
import Container from '@/components/tailwindui/Container'

export async function generateStaticParams() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const projects = await microCMS.listAllProjects()
  return projects.map((project) => ({
    slug: project.id,
  }))
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const project = await microCMS.listAllProjects().then(projects => 
    projects.find(p => p.id === params.slug)
  )

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <Container className="mt-8 sm:mt-16">
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:max-w-lg lg:self-end">
            <nav aria-label="Breadcrumb">
              <ol role="list" className="flex items-center space-x-2">
                <li>
                  <div className="flex items-center text-sm">
                    <a href="/ja/projects" className="font-medium text-gray-500 hover:text-gray-900">Projects</a>
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="ml-2 size-5 shrink-0 text-gray-300">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                  </div>
                </li>
                {project.project_type.map(type => (
                  <li key={type}>
                    <div className="flex items-center text-sm">
                      <a href="#" className="font-medium text-gray-500 hover:text-gray-900">{type}</a>
                      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="ml-2 size-5 shrink-0 text-gray-300">
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{project.title}</h1>
            </div>
            <section aria-labelledby="information-heading" className="mt-4">
              <h2 id="information-heading" className="sr-only">Product information</h2>
              <div className="flex items-center">
                <p className="text-lg text-gray-900 sm:text-xl">Free to use</p>
                {project.published_at && (
                  <div className="ml-4 border-l border-gray-300 pl-4">
                    <h2 className="sr-only">Release date</h2>
                    <div className="flex items-center">
                      <p className="ml-2 text-sm text-gray-500">Released at {new Date(project.published_at).toLocaleDateString('ja-JP', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}</p>
                    </div>
                  </div>
                )}
              </div>
              {project.about && (
                <div className="mt-4 space-y-6">
                  <p className="text-base text-gray-500">{project.about.replace(/<[^>]*>/g, '')}</p>
                </div>
              )}
            </section>
          </div>
          <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
            <div className="shadow-lg px-8 py-8">
              {project.image && (
                <>
                  <img
                    src={project.image.url}
                    alt={project.title}
                    className="w-full rounded-lg object-cover"
                    width={project.image.width}
                    height={project.image.height}
                  />
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-center block mt-4"
                  >{project.url}</a>
                </>
              )}
            </div>
          </div>
          <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
            <section aria-labelledby="options-heading">
              <h2 id="options-heading" className="sr-only">Product info</h2>
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-900">tools</h2>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {project.tags.map(tag => (
                    <div
                      key={tag}
                      className="flex items-center justify-center rounded-md border px-3 py-3 text-sm font-medium sm:flex-1"
                    >
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                >Visit application</a>
              </div>
            </section>
          </div>
        </div>
      </div>
      {project.background && (
        <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl my-4">Background</h2>
          <div dangerouslySetInnerHTML={{ __html: project.background }} />
        </div>
      )}
      {project.architecture && (
        <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl my-4">Architecture</h2>
          <div dangerouslySetInnerHTML={{ __html: project.architecture }} />
        </div>
      )}
    </Container>
  )
}

