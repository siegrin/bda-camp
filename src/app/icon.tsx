import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'hsl(18 70% 10%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(23 89% 51%)',
          borderRadius: '8px',
          border: '2px solid hsl(23 89% 51%)'
        }}
      >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            fill="none"
            style={{ width: '80%', height: '80%' }}
        >
            <path
                d="M50 5 L95 95 H5 Z"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinejoin="round"
                fill="hsl(23 89% 51% / 0.1)"
            />
            <path
                d="M30 95 L50 55 L70 95"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <path
                d="M50 95 L60 75 L70 95"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}
