import ProjectDetailPage from '@/components/containers/pages/ProjectDetailPage'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

export async function generateStaticParams() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const projects = await microCMS.listAllProjects()
  return projects.map((project) => ({
    slug: project.id,
  }))
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const project = await microCMS
    .listAllProjects()
    .then((projects) => projects.find((p) => p.id === slug))

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <ProjectDetailPage
      project={project}
      lang="ja"
      basePath="/ja/projects"
      sectionLabel="Projects"
    />
  )
}
