'use client'

import { useEffect } from 'react'

export function DarkModeScript() {
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function updateMode() {
      const isSystemDarkMode = darkModeMediaQuery.matches
      const isDarkMode =
        window.localStorage.isDarkMode === 'true' ||
        (!('isDarkMode' in window.localStorage) && isSystemDarkMode)

      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      if (isDarkMode === isSystemDarkMode) {
        delete window.localStorage.isDarkMode
      }
    }

    function disableTransitionsTemporarily() {
      document.documentElement.classList.add('[&_*]:!transition-none')
      window.setTimeout(() => {
        document.documentElement.classList.remove('[&_*]:!transition-none')
      }, 0)
    }

    function updateModeWithoutTransitions() {
      disableTransitionsTemporarily()
      updateMode()
    }

    updateMode()
    darkModeMediaQuery.addEventListener('change', updateModeWithoutTransitions)
    window.addEventListener('storage', updateModeWithoutTransitions)

    return () => {
      darkModeMediaQuery.removeEventListener('change', updateModeWithoutTransitions)
      window.removeEventListener('storage', updateModeWithoutTransitions)
    }
  }, [])

  return null
}
