'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'

type HubSpotFormProps = {
  formId: string
  portalId?: string
  region?: string
  className?: string
}

/**
 * Render a HubSpot form container and load/initialize HubSpot's forms script to mount the form.
 *
 * @param formId - The HubSpot form GUID to render.
 * @param portalId - Optional HubSpot portal ID. If omitted, falls back to `process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID`.
 * @param region - HubSpot region to use (e.g., `'na1'`); defaults to `'na1'`.
 * @param className - Optional additional CSS class(es) applied to the form container.
 * @returns A React element containing the HubSpot form container, or `null` if `formId` is falsy.
 */
export default function HubSpotForm({
  formId,
  portalId,
  region = 'na1',
  className = '',
}: HubSpotFormProps) {
  const formRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    // HubSpotスクリプトが読み込まれた後にフォームを初期化
    if (scriptLoadedRef.current && formRef.current && window.hbspt) {
      const targetId = formRef.current.id || `hubspot-form-${formId}`
      if (!document.getElementById(targetId)) {
        formRef.current.id = targetId
      }

      // 既存のフォームをクリアしてから新しいフォームを作成
      if (formRef.current.querySelector('.hs-form')) {
        return
      }

      window.hbspt.forms.create({
        portalId: portalId || process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID,
        formId,
        target: `#${targetId}`,
        region,
      })
    }
  }, [formId, portalId, region])

  const handleScriptLoad = () => {
    scriptLoadedRef.current = true
    // スクリプト読み込み後にフォームを初期化
    if (formRef.current && window.hbspt) {
      const targetId = formRef.current.id || `hubspot-form-${formId}`
      if (!formRef.current.id) {
        formRef.current.id = targetId
      }

      window.hbspt.forms.create({
        portalId: portalId || process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID,
        formId,
        target: `#${targetId}`,
        region,
      })
    }
  }

  // フォームIDが未設定の場合は何も表示しない
  if (!formId) {
    return null
  }

  return (
    <>
      <Script
        type="text/javascript"
        src="https://js.hsforms.net/forms/v2.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <div
        ref={formRef}
        className={`hubspot-form-container ${className}`}
        style={{
          maxWidth: '100%',
        }}
      />
    </>
  )
}

// HubSpotの型定義を拡張
declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (options: {
          portalId?: string
          formId: string
          target: string
          region?: string
        }) => void
      }
    }
  }
}
