'use client'

import { InArticleAd as NextInArticleAd } from 'next-google-ads'
import { SITE_CONFIG } from '@/config'

type InArticleAdProps = {
  className?: string
}

/**
 * In-Article Ad コンポーネント
 * 記事コンテンツ内に自然に統合される広告フォーマット
 */
export default function InArticleAd({ className = '' }: InArticleAdProps) {
  return (
    <div className={`my-8 ${className}`}>
      <NextInArticleAd
        client={SITE_CONFIG.googleAds.publisherId}
        slot={SITE_CONFIG.googleAds.inArticleAd.slot}
      />
    </div>
  )
}
