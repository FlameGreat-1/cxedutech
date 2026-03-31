import { useRef } from 'react';
import { useScroll, motion, useTransform, MotionValue } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StackingCardData {
  title: string;
  description: string;
  src: string;
  alt: string;
  color: string;
  textColor: string;
  accentColor: string;
  icon: string;
}

interface StackingCardProps extends StackingCardData {
  i: number;
  progress: MotionValue<number>;
  range: number[];
  targetScale: number;
  total: number;
}

/* ------------------------------------------------------------------ */
/*  Single Card                                                        */
/* ------------------------------------------------------------------ */

function StackingCard({
  i,
  title,
  description,
  src,
  alt,
  color,
  textColor,
  accentColor,
  icon,
  progress,
  range,
  targetScale,
  total,
}: StackingCardProps) {
  const container = useRef<HTMLDivElement>(null);

  /* Per-card scroll: drives the parallax image zoom */
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.5, 1]);

  /* Global progress: drives the scale-down when next card stacks on top */
  const scale = useTransform(progress, range, [1, targetScale]);

  /*
   * Each card's sticky top = header height (64px) + stacking offset.
   * The stacking offset (i * 25px) pushes each card slightly lower
   * so you can see the top edge of previous cards peeking above,
   * creating the visual "stack of cards" depth effect.
   */
  const stickyTop = 64 + i * 25;

  return (
    <div
      ref={container}
      className="h-screen"
      style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}
    >
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          position: 'sticky',
          top: stickyTop,
        }}
        className="relative flex flex-col w-[90%] max-w-[900px]
          h-[340px] sm:h-[420px] lg:h-[480px]
          rounded-2xl sm:rounded-3xl overflow-hidden origin-top
          shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)]
          border border-white/10"
      >
        {/* Inner layout: stacks vertically on mobile, side-by-side on sm+ */}
        <div className="flex flex-col sm:flex-row h-full">

          {/* TEXT SIDE */}
          <div className="w-full sm:w-[45%] p-5 sm:p-8 lg:p-10 flex flex-col justify-center shrink-0">
            {/* Icon */}
            <div
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-5"
              style={{ backgroundColor: accentColor }}
            >
              <svg
                className="w-5 h-5 sm:w-7 sm:h-7"
                style={{ color: textColor }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>

            <h3
              className="text-lg sm:text-2xl lg:text-3xl font-bold leading-tight mb-2 sm:mb-4"
              style={{ color: textColor }}
            >
              {title}
            </h3>

            <p
              className="text-xs sm:text-sm lg:text-base leading-relaxed"
              style={{ color: textColor, opacity: 0.85 }}
            >
              {description}
            </p>
          </div>

          {/* IMAGE SIDE */}
          <div className="w-full sm:w-[55%] relative flex-1 min-h-0">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="w-full h-full"
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
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout wrapper                                                     */
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
    <section ref={container} className="relative">
      {cards.map((card, i) => {
        const targetScale = 1 - (cards.length - i) * 0.05;
        return (
          <StackingCard
            key={i}
            i={i}
            {...card}
            progress={scrollYProgress}
            range={[i * (1 / cards.length), 1]}
            targetScale={targetScale}
            total={cards.length}
          />
        );
      })}
    </section>
  );
}
