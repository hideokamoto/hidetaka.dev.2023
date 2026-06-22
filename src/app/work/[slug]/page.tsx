import type { Metadata } from 'next'
import ProjectDetailPage from '@/components/containers/pages/ProjectDetailPage'
import { generateProjectMetadata } from '@/libs/metadata'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

export async function generateStaticParams() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const projects = await microCMS.listAllProjects()
  return projects.map((project) => ({
    slug: project.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const project = await microCMS
    .listAllProjects()
    .then((projects) => projects.find((p) => p.id === slug))

  if (!project) {
    return { title: 'Work' }
  }

  return generateProjectMetadata(project, 'en')
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

  return <ProjectDetailPage project={project} lang="en" basePath="/work" sectionLabel="Work" />
}
