'use client'

import clarity from '@microsoft/clarity'
import { useEffect } from 'react'

export function ClarityAnalytics() {
  useEffect(() => {
    // Initialize Microsoft Clarity with project ID
    clarity.init('u9k95lfa82')
  }, [])

  return null
}
