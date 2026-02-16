import PortfolioPageContent from '@/components/containers/pages/PortfolioPage'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

export const metadata = {
  title: 'Portfolio',
}

export default async function PortfolioPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const projects = await microCMS.listAllProjects()

  return <PortfolioPageContent lang="en" projects={projects} />
}
