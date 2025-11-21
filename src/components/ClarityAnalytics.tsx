'use client'

import clarity from '@microsoft/clarity'
import { useEffect } from 'react'

export function ClarityAnalytics() {
  useEffect(() => {
    // Only initialize Microsoft Clarity in production environment
    if (process.env.NODE_ENV === 'production') {
      clarity.init('u9k95lfa82')
    }
  }, [])

  return null
}
