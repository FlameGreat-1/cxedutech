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

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.6, 1]);

  /* Global progress: drives the scale-down when next card stacks on top */
  const scale = useTransform(progress, range, [1, targetScale]);

  /*
   * Vertical offset so stacked cards peek behind each other.
   * On mobile we use a tighter 16px step; on desktop 25px.
   */
  const topOffset = `calc(-5vh + ${i * 25}px)`;
  const topOffsetMobile = `calc(-2vh + ${i * 16}px)`;

  /* Unique class per card instance to avoid style collisions */
  const cardClass = `stacking-card-${i}`;

  return (
    <div
      ref={container}
      className="h-[85vh] sm:h-screen flex items-center justify-center sticky top-0"
    >
      <motion.div
        style={{
          backgroundColor: color,
          scale,
        }}
        className={`${cardClass} relative flex flex-col w-[92vw] sm:w-[90vw] max-w-4xl
          rounded-2xl sm:rounded-3xl overflow-hidden
          shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)]
          border border-white/10`}
      >
        {/* Inner layout: stacks vertically on mobile, side-by-side on sm+ */}
        <div className="flex flex-col sm:flex-row h-full">

          {/* TEXT SIDE */}
          <div className="w-full sm:w-[45%] p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            {/* Icon */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5"
              style={{ backgroundColor: accentColor }}
            >
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
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
              className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-3 sm:mb-4"
              style={{ color: textColor }}
            >
              {title}
            </h3>

            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: textColor, opacity: 0.85 }}
            >
              {description}
            </p>
          </div>

          {/* IMAGE SIDE */}
          <div className="w-full sm:w-[55%] relative min-h-[200px] sm:min-h-0">
            <div className="absolute inset-0 overflow-hidden sm:rounded-r-3xl">
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

      {/* Per-card scoped styles for responsive top offset and height */}
      <style>{`
        .${cardClass} {
          top: ${topOffsetMobile};
          height: 380px;
        }
        @media (min-width: 640px) {
          .${cardClass} {
            top: ${topOffset};
            height: 420px;
          }
        }
        @media (min-width: 1024px) {
          .${cardClass} {
            height: 480px;
          }
        }
      `}</style>
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
