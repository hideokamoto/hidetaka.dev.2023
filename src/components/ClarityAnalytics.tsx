'use client'

import { useEffect } from 'react'
import clarity from '@microsoft/clarity'

export function ClarityAnalytics() {
  useEffect(() => {
    // Initialize Microsoft Clarity with project ID
    clarity.init('u9k95lfa82')
  }, [])

  return null
}
