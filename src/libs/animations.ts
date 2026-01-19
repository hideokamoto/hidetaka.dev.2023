'use client'

/**
 * Scroll animations using Intersection Observer API
 * Implements fade-in animations with stagger delays for elements
 */

// Animation observer options
const observerOptions: IntersectionObserverInit = {
	threshold: 0.1,
	rootMargin: '0px 0px -50px 0px',
}

/**
 * Initialize scroll animations for elements
 * Adds fade-in-up animation classes when elements enter viewport
 */
export function initScrollAnimations() {
	// Check if user prefers reduced motion
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('fade-in-up')
				observer.unobserve(entry.target)
			}
		})
	}, observerOptions)

	// Observe all sections, cards, and animated elements
	const elementsToAnimate = document.querySelectorAll(
		'section, .card, .service-card, .project-card, .article-card, [data-animate]',
	)

	elementsToAnimate.forEach((el, index) => {
		// Add stagger delay class
		const staggerIndex = (index % 4) + 1
		el.classList.add(`stagger-${staggerIndex}`)
		observer.observe(el)
	})
}

/**
 * Initialize navbar scroll effect
 * Adds blur and background on scroll
 */
export function initNavbarScroll() {
	const navbar = document.querySelector('header')
	if (!navbar) return

	let ticking = false

	const handleScroll = () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const scrollY = window.scrollY
				if (scrollY > 100) {
					navbar.classList.add('navbar-scrolled')
				} else {
					navbar.classList.remove('navbar-scrolled')
				}
				ticking = false
			})
			ticking = true
		}
	}

	window.addEventListener('scroll', handleScroll, { passive: true })
}

/**
 * Initialize all animations
 * Call this function when the page loads
 */
export function initAnimations() {
	if (typeof window === 'undefined') return

	// Wait for DOM to be ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			initScrollAnimations()
			initNavbarScroll()
		})
	} else {
		initScrollAnimations()
		initNavbarScroll()
	}
}
