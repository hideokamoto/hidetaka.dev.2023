import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sanity Studio | Hidetaka.dev',
  description: 'Content management system for Hidetaka.dev',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  // Return children directly - Sanity Studio provides its own layout
  return <>{children}</>
}
