import { toYouTubeEmbedUrl } from '@/lib/youtube'

interface Props {
  url: string
  title?: string
  className?: string
}

/** V1 guest player — YouTube Live / VOD embed */
export function YouTubeEmbed({ url, title = 'YouTube Live', className = '' }: Props) {
  const embed = toYouTubeEmbedUrl(url)

  if (!embed) {
    return (
      <div className={`flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-black/60 ${className}`}>
        <div className="px-6 text-center">
          <p className="font-display text-lg text-white">YouTube stream unavailable</p>
          <p className="mt-2 text-sm text-white/50">Invalid or missing YouTube Live URL.</p>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm text-gold-light underline"
            >
              Open link directly
            </a>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_40px_rgba(0,0,0,0.45)] ${className}`}>
      <div className="relative aspect-video w-full">
        <iframe
          src={embed}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  )
}

export default YouTubeEmbed
