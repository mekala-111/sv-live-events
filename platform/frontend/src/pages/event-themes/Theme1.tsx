import { YouTubeEmbed } from '@/components/stream/YouTubeEmbed'
import { motion } from 'framer-motion'
import { Share2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import { CREAM_THEMES, getCreamTheme, type CreamThemeDef } from './creamThemes'
import { toWhatsAppHref } from '@/lib/whatsapp'
import './theme1.css'

const CDN = 'https://push-1507.5centscdn.com/http/assets4/images1'

export type CreamThemeProps = {
  title: string
  theme?: CreamThemeDef | null
  designId?: string | null
  liveTimings?: string | null
  scrollMessage?: string | null
  youtubeLiveUrl?: string | null
  teaserUrl?: string | null
  watchLiveButton?: boolean
  socialShare?: boolean
  whatsappNumber?: string | null
  heroImage?: string | null
  /** Overrides theme accent when set from portal */
  fontColor?: string | null
  onShare?: () => void
  shareUrl?: string
}

/** Shared cream guest website — driven by one of 20 event presets */
export function CreamTheme({
  title,
  theme: themeProp,
  designId,
  liveTimings,
  scrollMessage,
  youtubeLiveUrl,
  teaserUrl,
  watchLiveButton = true,
  socialShare = true,
  whatsappNumber,
  heroImage,
  fontColor,
  onShare,
  shareUrl,
}: CreamThemeProps) {
  const theme = themeProp || getCreamTheme(designId) || CREAM_THEMES[0]
  const accent = fontColor || theme.accent

  return (
    <div
      className={`theme1-root theme1-layout-${theme.layout} theme1-font-${theme.titleFont}`}
      style={
        {
          '--t1-accent': accent,
          '--t1-accent-soft': theme.accentSoft,
          '--t1-bg-top': theme.bgTop,
          '--t1-bg-mid': theme.bgMid,
          '--t1-bg-bottom': theme.bgBottom,
          '--t1-text': theme.text,
          '--t1-muted': theme.muted,
        } as CSSProperties
      }
    >
      <section className="theme1-hero">
        <div className="theme1-hero-inner">
          <div className="theme1-top-ornament">
            <img src={`${CDN}/slider/top-image.png`} alt="" />
          </div>

          <p className="theme1-eyebrow">{theme.eyebrow}</p>

          <div className="theme1-hero-grid">
            <motion.div
              className="theme1-hero-media"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
            >
              <div className="theme1-love-frame">
                <img src={heroImage || `${CDN}/slider/pngtree.png`} alt={title} />
              </div>
            </motion.div>

            <motion.div
              className="theme1-hero-copy"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.15 }}
            >
              <div className="theme1-balloon">
                <img src={`${CDN}/slider/pngtree.png`} alt="" />
              </div>
              <h1 className="theme1-title">{title}</h1>
              {liveTimings ? <p className="theme1-timings">{liveTimings}</p> : null}
            </motion.div>
          </div>
        </div>

        <div className="theme1-bottom-shape">
          <img src={`${CDN}/slider/bottom-image.png`} alt="" />
        </div>
      </section>

      {scrollMessage ? (
        <section className="theme1-marquee-wrap">
          <div className="theme1-marquee">
            <span className="theme1-marquee-text">
              {scrollMessage}&nbsp;&nbsp;•&nbsp;&nbsp;{scrollMessage}&nbsp;&nbsp;•&nbsp;&nbsp;
            </span>
          </div>
        </section>
      ) : null}

      <section className="theme1-live" id="watch-live">
        <div className="theme1-live-card">
          <div className="theme1-flower theme1-flower-l">
            <img src={`${CDN}/couple/flower1.png`} alt="" />
          </div>
          <div className="theme1-flower theme1-flower-r">
            <img src={`${CDN}/couple/flower2.png`} alt="" />
          </div>

          {watchLiveButton && youtubeLiveUrl ? (
            <YouTubeEmbed
              url={youtubeLiveUrl}
              title={title}
              className="theme1-player"
            />
          ) : youtubeLiveUrl ? (
            <a href={youtubeLiveUrl} target="_blank" rel="noreferrer" className="theme1-cta">
              Watch Live
            </a>
          ) : (
            <p className="theme1-waiting">Live stream will appear here when the host goes live.</p>
          )}

          {teaserUrl ? (
            <a href={teaserUrl} target="_blank" rel="noreferrer" className="theme1-teaser-link">
              Watch Teaser →
            </a>
          ) : null}

          <div className="theme1-actions">
            {socialShare && onShare ? (
              <button type="button" className="theme1-action-btn" onClick={onShare}>
                <Share2 className="h-4 w-4" /> Share
              </button>
            ) : null}
            {socialShare && shareUrl ? (
              <button
                type="button"
                className="theme1-action-btn"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                Copy Link
              </button>
            ) : null}
            {whatsappNumber ? (
              <a
                href={toWhatsAppHref(whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                className="theme1-action-btn"
              >
                WhatsApp Support
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="theme1-thanks">
        <div className="theme1-thanks-inner">
          <h2>{theme.thanksLabel}</h2>
          <p>{theme.thanksLine}</p>
        </div>
        <div className="theme1-frame theme1-frame-l">
          <img src="https://push-1507.5centscdn.com/http/assets4/images/slider/invitation-shape-1.png" alt="" />
        </div>
        <div className="theme1-frame theme1-frame-r">
          <img src="https://push-1507.5centscdn.com/http/assets4/images/slider/invitation-shape-2.png" alt="" />
        </div>
      </section>
    </div>
  )
}

/** @deprecated use CreamTheme — kept for Theme 1 imports */
export function Theme1(props: CreamThemeProps) {
  return <CreamTheme {...props} designId={props.designId || 'cream-01-birthday'} />
}

export default CreamTheme
