import WorkPageContent from '@/components/containers/pages/WorkPage'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import { listMyNPMPackages } from '@/libs/dataSources/npmjs'
import { listMyWordPressPlugins } from '@/libs/dataSources/wporg'

export const metadata = {
  title: 'Work',
}

export default async function WorkPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const projects = await microCMS.listAllProjects()
  const npmPackages = await listMyNPMPackages()
  const wpPlugins = await listMyWordPressPlugins()

  return <WorkPageContent lang="en" projects={projects} npmPackages={npmPackages} wpPlugins={wpPlugins} />
}

