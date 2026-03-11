import ProductsPageContent from '@/components/containers/pages/ProductsPage'
import { listMyNPMPackages } from '@/libs/dataSources/npmjs'
import { listMyWordPressPlugins } from '@/libs/dataSources/wporg'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

export const metadata = {
  title: 'Products',
}

export default async function ProductsPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const projects = await microCMS.listAllProjects()
  const npmPackages = await listMyNPMPackages()
  const wpPlugins = await listMyWordPressPlugins()

  return (
    <ProductsPageContent
      lang="en"
      projects={projects}
      npmPackages={npmPackages}
      wpPlugins={wpPlugins}
    />
  )
}
