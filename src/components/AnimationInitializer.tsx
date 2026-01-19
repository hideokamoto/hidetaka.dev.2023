'use client'

import { useEffect } from 'react'
import { initAnimations } from '@/libs/animations'

/**
 * Client component to initialize scroll animations
 * Must be used in a client component context
 */
export default function AnimationInitializer() {
	useEffect(() => {
		initAnimations()
	}, [])

	return null
}
