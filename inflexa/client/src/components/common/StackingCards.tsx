import { useRef } from 'react';
import { useScroll, motion, useTransform, MotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface StackingCardData {
  title: string;
  description: string;
  src: string;
  alt: string;
  label: string;
  icon: string;
  ctaText?: string;
  ctaLink?: string;
  /**
   * ALL color values MUST be CSS variable references from globals.css.
   * e.g. 'var(--color-brand-900)'
   * NEVER pass raw hex values — use the design token system.
   *
   * panelColor      → text-side background
   * imagePanelColor → image-side background
   * textColor       → all text on this card (always white for dark panels)
   * accentColor     → label pill, divider bar, CTA border, icon badge
   */
  panelColor: string;
  imagePanelColor: string;
  textColor: string;
  accentColor: string;
}

interface StackingCardProps extends StackingCardData {
  i: number;
  progress: MotionValue<number>;
  range: number[];
  targetScale: number;
}

/* ------------------------------------------------------------------ */
/*  Organic SVG background patterns                                    */
/*                                                                     */
/*  BRAND.md §3 — "Curves, Loops, Abstract lines"                     */
/*  → Flexibility · Flow · Adaptability                                */
/*                                                                     */
/*  Each pattern uses stroke="currentColor" so it inherits the        */
/*  card's textColor CSS variable automatically.                       */
/* ------------------------------------------------------------------ */

const ORGANIC_PATTERNS: string[] = [
  /* A — looping double arc + concentric circles */
  `<svg width="100%" height="100%" viewBox="0 0 420 320" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M-20 160 C 80 40 180 40 210 160 S 330 280 440 160" stroke="currentColor" stroke-width="2.5" opacity="0.15"/>
    <path d="M-20 210 C 80 90 180 90 210 210 S 330 330 440 210" stroke="currentColor" stroke-width="2" opacity="0.1"/>
    <path d="M50 -20 C 100 80 80 200 210 230 S 310 140 400 260" stroke="currentColor" stroke-width="2" opacity="0.12"/>
    <circle cx="340" cy="70" r="52" stroke="currentColor" stroke-width="2" opacity="0.09"/>
    <circle cx="340" cy="70" r="26" stroke="currentColor" stroke-width="1.5" opacity="0.07"/>
  </svg>`,

  /* B — spiral + dual sine wave */
  `<svg width="100%" height="100%" viewBox="0 0 420 320" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M360 160 C 360 90 280 40 200 65 S 90 140 115 210 S 200 305 280 280 S 390 235 360 160" stroke="currentColor" stroke-width="2.5" opacity="0.14"/>
    <path d="M-20 90 Q 100 20 210 90 T 440 90" stroke="currentColor" stroke-width="2" opacity="0.12"/>
    <path d="M-20 230 Q 100 160 210 230 T 440 230" stroke="currentColor" stroke-width="2" opacity="0.09"/>
    <circle cx="70" cy="270" r="40" stroke="currentColor" stroke-width="2" opacity="0.09"/>
  </svg>`,

  /* C — diagonal crosshatch arcs + circle */
  `<svg width="100%" height="100%" viewBox="0 0 420 320" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M-50 320 C 100 180 260 140 470 -30" stroke="currentColor" stroke-width="2.5" opacity="0.13"/>
    <path d="M-50 240 C 100 100 260 70 470 -90" stroke="currentColor" stroke-width="2" opacity="0.09"/>
    <path d="M20 340 C 120 200 300 160 490 40" stroke="currentColor" stroke-width="1.5" opacity="0.09"/>
    <path d="M210 320 C 160 230 230 140 310 65 S 390 20 420 -30" stroke="currentColor" stroke-width="2" opacity="0.11"/>
    <circle cx="50" cy="70" r="64" stroke="currentColor" stroke-width="2" opacity="0.07"/>
  </svg>`,

  /* D — figure-8 loop */
  `<svg width="100%" height="100%" viewBox="0 0 420 320" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M210 160 C 210 90 280 45 330 90 S 355 210 280 235 S 150 210 125 160 S 125 70 210 70 S 310 95 330 160" stroke="currentColor" stroke-width="2.5" opacity="0.13"/>
    <path d="M-20 70 C 50 20 130 70 100 145 S 25 190 75 240 S 180 260 210 210" stroke="currentColor" stroke-width="2" opacity="0.11"/>
    <path d="M260 330 C 340 280 420 210 390 140 S 310 70 360 20" stroke="currentColor" stroke-width="2" opacity="0.09"/>
  </svg>`,
];

/* ------------------------------------------------------------------ */
/*  Single Card                                                         */
/* ------------------------------------------------------------------ */

function StackingCard({
  i,
  title,
  description,
  src,
  alt,
  panelColor,
  imagePanelColor,
  textColor,
  accentColor,
  label,
  icon,
  ctaText,
  ctaLink,
  progress,
  range,
  targetScale,
}: StackingCardProps) {
  const container = useRef<HTMLDivElement>(null);

  /* Per-card scroll: parallax image zoom-out as card enters viewport */
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  /* Global scroll: scale-down push when next card stacks on top */
  const scale = useTransform(progress, range, [1, targetScale]);

  const patternSvg = ORGANIC_PATTERNS[i % ORGANIC_PATTERNS.length];

  return (
    /*
     * ── Sticky spacer height = scroll travel distance per card ───
     *
     * h-[50vh] sm:h-[55vh] lg:h-[60vh] → tighter gap between card transitions.
     * Cards transition snappily without touching.
     * top-[4vh] → tiny peek of card above viewport top so stacking
     * overlap is visible and the parallax feels intentional.
     */
    <div
      ref={container}
      className="h-[65vh] sm:h-[75vh] lg:h-[85vh] flex items-center justify-center sticky top-0"
    >
      {/* Outer: scroll-driven scale (stacking push-back effect) */}
      <motion.div
        style={{ scale }}
        className="w-full flex justify-center origin-top px-4 sm:px-6 lg:px-8"
      >
        {/*
         * Inner: hover-driven zoom — deliberately SEPARATE from the
         * scroll scale motion.div so both transforms compose cleanly
         * without overwriting each other.
         */}
        <motion.div
          whileHover={{ scale: 1.025 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="
            relative flex flex-col sm:flex-row
            w-full max-w-[1160px]
            h-[340px] sm:h-[440px] lg:h-[500px]
            rounded-2xl lg:rounded-3xl overflow-hidden
            shadow-[0_24px_80px_-16px_rgba(0,0,0,0.25)]
            cursor-pointer will-change-transform
          "
          style={{ backgroundColor: panelColor }}
        >

          {/* ════════════════════════════════════════════════════
              LEFT — Text panel
          ════════════════════════════════════════════════════ */}
          <div
            className="
              relative z-10
              w-full sm:w-[44%]
              flex flex-col justify-center
              px-6 sm:px-10 lg:px-14
              py-6 sm:py-10
              shrink-0
            "
          >
            <div className="relative z-10 flex flex-col gap-3 sm:gap-4 lg:gap-5">

              {/* Label pill with icon */}
              <span
                className="
                  inline-flex items-center gap-2 self-start
                  px-3 py-1 rounded-full
                  text-[10px] sm:text-[11px]
                  font-bold tracking-[0.12em] uppercase
                "
                style={{
                  color: accentColor,
                  backgroundColor: `color-mix(in srgb, ${accentColor} 16%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${accentColor} 38%, transparent)`,
                }}
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                  style={{ color: accentColor }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                {label}
              </span>

              {/* Heading — BRAND.md: ultra-bold, tight tracking */}
              <h3
                className="
                  text-[1.22rem] sm:text-[1.68rem] lg:text-[2rem]
                  font-extrabold leading-[1.08] tracking-tight
                  whitespace-pre-line
                "
                style={{ color: textColor }}
              >
                {title}
              </h3>

              {/* Accent divider */}
              <div
                className="w-10 h-[3px] rounded-full"
                style={{ backgroundColor: accentColor }}
              />

              {/* Body copy */}
              <p
                className="
                  text-[12.5px] sm:text-[14.5px] lg:text-[15px]
                  leading-relaxed max-w-[26rem]
                "
                style={{ color: textColor, opacity: 0.82 }}
              >
                {description}
              </p>

              {/* CTA link */}
              {ctaText && ctaLink && (
                <Link
                  to={ctaLink}
                  className="
                    self-start mt-1
                    inline-flex items-center gap-2
                    px-5 py-2.5
                    text-[12.5px] sm:text-[13.5px] font-semibold
                    rounded-xl border-2
                    transition-all duration-200
                    hover:gap-3
                  "
                  style={{
                    color: accentColor,
                    borderColor: `color-mix(in srgb, ${accentColor} 45%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                  }}
                >
                  {ctaText}
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════
              RIGHT — Image panel (full-bleed coloured bg)
          ════════════════════════════════════════════════════ */}
          <div
            className="relative flex-1 min-w-0 overflow-hidden"
            style={{ backgroundColor: imagePanelColor }}
          >
            {/* Organic SVG pattern overlay — BRAND.md §3 */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: patternSvg }}
            />

            {/* Left edge fade: image panel → text panel */}
            <div
              className="absolute left-0 top-0 h-full w-20 sm:w-28 z-20 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${imagePanelColor}, transparent)`,
              }}
            />

            {/* Top vignette */}
            <div
              className="absolute top-0 left-0 right-0 h-24 z-20 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, color-mix(in srgb, ${imagePanelColor} 65%, transparent), transparent)`,
              }}
            />

            {/* Bottom vignette */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24 z-20 pointer-events-none"
              style={{
                background: `linear-gradient(to top, color-mix(in srgb, ${imagePanelColor} 50%, transparent), transparent)`,
              }}
            />

            {/* Parallax image */}
            <motion.div
              className="absolute inset-0 z-0"
              style={{ scale: imageScale }}
            >
              <img
                src={src}
                alt={alt}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
              />
            </motion.div>

            {/* Card index watermark — top-right */}
            <div
              className="
                absolute top-5 right-5 z-30
                text-[11px] font-bold tracking-[0.15em]
                tabular-nums select-none
              "
              style={{ color: textColor, opacity: 0.22 }}
            >
              0{i + 1}
            </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                     */
/* ------------------------------------------------------------------ */

export default function StackingCardsSection({
  cards,
}: {
  cards: StackingCardData[];
}) {
  const container = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      ref={container}
      className="relative"
      style={{ overflowX: 'clip' }}
    >
      {cards.map((card, i) => {
        /*
         * targetScale: cards behind the front card shrink 4% each.
         * Card at index 0 gets the smallest scale (most pushed back).
         * Card at index N-1 (front) is always scale 1.
         */
        const targetScale = 1 - (cards.length - 1 - i) * 0.04;

        return (
          <StackingCard
            key={i}
            i={i}
            {...card}
            progress={scrollYProgress}
            range={[i / cards.length, (i + 1) / cards.length]}
            targetScale={targetScale}
          />
        );
      })}
    </section>
  );
}