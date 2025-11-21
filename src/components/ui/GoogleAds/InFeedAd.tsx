'use client'

import { InFeedAd as NextInFeedAd } from 'next-google-ads'
import { SITE_CONFIG } from '@/config'

type InFeedAdProps = {
  className?: string
}

/**
 * In-Feed Ad コンポーネント
 * リスト、フィード、カードベースのレイアウトに統合される広告フォーマット
 */
export default function InFeedAd({ className = '' }: InFeedAdProps) {
  return (
    <div className={`${className}`}>
      <NextInFeedAd
        client={SITE_CONFIG.googleAds.publisherId}
        slot={SITE_CONFIG.googleAds.inFeedAd.slot}
        layoutKey={SITE_CONFIG.googleAds.inFeedAd.layoutKey}
      />
    </div>
  )
}
