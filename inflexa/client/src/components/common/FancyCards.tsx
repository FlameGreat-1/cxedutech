import React from 'react';

export interface FancyCard {
  src: string;
  alt: string;
}

export interface FancyCardsProps {
  images: FancyCard[];
  className?: string;
  cardWidth?: string;
  radius?: string;
  arcSize?: number;
  arcCenter?: number;
  arcShiftDelta?: number;
  hoverAnchor?: string;
  containerHeight?: string;
}

/*
 * Organic "Bent Mango" blob shapes for hero image containers.
 *
 * Each shape is a CSS clip-path polygon that creates an asymmetric,
 * organic silhouette — left side more curved, right side slightly
 * flattened or cut, top/bottom with uneven curvature.
 *
 * We cycle through several variations so adjacent cards don't look
 * identical, adding visual rhythm and personality to the arc carousel.
 *
 * Brand alignment (BRAND.md §3 — Organic Shapes):
 *   "Curves, Loops, Abstract lines → Flexibility, Flow, Adaptability"
 *   "Use in: Hero sections"
 */
const BLOB_SHAPES: string[] = [
  // Shape A — wider left curve, flattened right, slight bottom tilt
  `polygon(
    12% 2%,
    35% 0%,
    65% 1%,
    88% 5%,
    97% 18%,
    99% 40%,
    98% 65%,
    94% 82%,
    85% 95%,
    65% 99%,
    38% 98%,
    15% 94%,
    4% 80%,
    1% 58%,
    0% 35%,
    3% 15%
  )`,
  // Shape B — taller left bulge, diagonal cut top-right
  `polygon(
    10% 4%,
    30% 0%,
    58% 2%,
    82% 0%,
    96% 10%,
    100% 30%,
    98% 55%,
    96% 78%,
    88% 94%,
    68% 100%,
    42% 98%,
    18% 96%,
    5% 85%,
    0% 62%,
    1% 38%,
    4% 16%
  )`,
  // Shape C — pinched top, wide organic bottom
  `polygon(
    15% 3%,
    40% 0%,
    68% 2%,
    90% 6%,
    98% 22%,
    100% 45%,
    97% 70%,
    90% 90%,
    72% 98%,
    48% 100%,
    25% 97%,
    8% 88%,
    1% 68%,
    0% 42%,
    2% 20%,
    7% 8%
  )`,
  // Shape D — asymmetric mango: left side deeply curved, right side straighter
  `polygon(
    14% 1%,
    38% 0%,
    62% 3%,
    85% 2%,
    95% 14%,
    99% 35%,
    100% 58%,
    96% 80%,
    86% 96%,
    62% 100%,
    35% 97%,
    12% 92%,
    2% 75%,
    0% 50%,
    1% 28%,
    5% 10%
  )`,
  // Shape E — rotated capsule feel, uneven edges
  `polygon(
    18% 0%,
    45% 1%,
    72% 0%,
    92% 8%,
    100% 25%,
    98% 50%,
    96% 72%,
    88% 92%,
    70% 100%,
    45% 98%,
    20% 100%,
    6% 90%,
    0% 68%,
    1% 42%,
    3% 20%,
    8% 6%
  )`,
];

export default function FancyCards({
  images,
  className = '',
  cardWidth = 'clamp(120px, 20vmin, 200px)',
}: FancyCardsProps) {
  const cardsCount = images.length;
  const middle = (cardsCount - 1) / 2;
  const baseCardWidth = cardWidth;

  /*
   * Reference: Lightswind UI "Circular Carousel"
   *
   * Key visual properties from the reference:
   * 1. All cards share a single pivot point FAR below the visible card area.
   *    This creates a true circular arc — bottoms cluster, tops fan apart.
   * 2. Cards overlap heavily (~40-50% of their width).
   * 3. The center card is the highest. Outer cards drop progressively.
   * 4. Rotation per step is ~12-15 degrees.
   * 5. Center card has the highest z-index; outer cards tuck underneath.
   */

  return (
    <div
      className={`relative flex justify-center items-end w-full overflow-visible ${className}`}
      style={{ height: 'clamp(260px, 40vmin, 420px)' }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .fancy-card-wrapper {
            position: absolute;
            transition: transform 0.45s cubic-bezier(0.22, 0.68, 0, 1.02), z-index 0s;
            /* 
             * The CRITICAL trick: push the pivot point extremely far below 
             * the card (300%). This makes rotation act like orbiting around  
             * a distant circle center, so the bottoms converge tightly  
             * while the tops arc outward — exactly like the reference.
             */
            transform-origin: 50% 300%;
          }
          .fancy-card-wrapper:hover {
            z-index: 50 !important;
            transform: rotate(0deg) scale(1.12) !important;
          }

          /* Organic blob container */
          .fancy-blob-container {
            position: relative;
            width: 100%;
            aspect-ratio: 4 / 6;
            transition: filter 0.3s ease, box-shadow 0.3s ease;
            filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.35));
          }
          .fancy-card-wrapper:hover .fancy-blob-container {
            filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.45));
          }

          .fancy-blob-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
            transition: clip-path 0.5s cubic-bezier(0.22, 0.68, 0, 1.02);
          }
        `
      }} />

      {images.map((img, i) => {
        const offset = i - middle;

        // ~13 degrees per card step — matches the reference arc spread
        const rotation = offset * 13;

        // Center card is highest z-index; outer cards go underneath
        const zIndex = cardsCount - Math.abs(offset);

        // Cycle through blob shapes so adjacent cards differ
        const blobShape = BLOB_SHAPES[i % BLOB_SHAPES.length];

        return (
          <div
            key={i}
            className="fancy-card-wrapper cursor-pointer"
            style={{
              zIndex,
              width: baseCardWidth,
              bottom: 0,
              transform: `rotate(${rotation}deg)`,
            } as React.CSSProperties}
          >
            <div className="fancy-blob-container">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                draggable={false}
                className="fancy-blob-img"
                style={{ clipPath: blobShape }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
