import { ImageResponse } from '@vercel/og'
import { getThoughtBySlug } from '@/libs/dataSources/thoughts'

export const runtime = 'edge'

export const alt = 'Blog Post'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const thought = await getThoughtBySlug(slug, 'en')

  if (!thought) {
    // デフォルト画像を返す
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          Hidetaka.dev
        </div>
      ),
      {
        ...size,
      }
    )
  }

  // カテゴリ情報を抽出
  const categories = thought._embedded?.['wp:term']
    ?.flat()
    .filter((term) => term.taxonomy === 'category')
    .map((term) => term.name) || []

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {categories.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              {categories.slice(0, 3).map((category) => (
                <div
                  key={category}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '24px',
                    fontWeight: '600',
                  }}
                >
                  {category}
                </div>
              ))}
            </div>
          )}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              lineHeight: '1.2',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {thought.title.rendered}
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: '600',
            }}
          >
            Hidetaka.dev
          </div>
          <div
            style={{
              fontSize: '24px',
              opacity: 0.9,
            }}
          >
            {new Date(thought.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
