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
 * Uses SVG <clipPath> with cubic bezier curves (C commands) to create
 * truly smooth, asymmetric organic silhouettes — not polygons.
 *
 * Each path is drawn in a 1×1 viewBox (0-1 coordinates) so it scales
 * to any card size via clipPathUnits="objectBoundingBox".
 *
 * Shape characteristics:
 *   - Left side: deeply curved (organic feel)
 *   - Right side: slightly flattened or cut
 *   - Top/bottom: uneven curvature
 *   - Overall: asymmetric, like a capsule gently "pushed" on one side
 *
 * Brand alignment (BRAND.md §3 — Organic Shapes):
 *   "Curves, Loops, Abstract lines → Flexibility, Flow, Adaptability"
 *   "Use in: Hero sections"
 */
const BLOB_PATHS: string[] = [
  // Shape A — wide left bulge, flattened right, tilted bottom
  'M 0.5 0.02 C 0.75 -0.02, 0.95 0.12, 0.92 0.35 C 0.9 0.55, 0.95 0.75, 0.85 0.92 C 0.72 1.05, 0.45 1.02, 0.3 0.95 C 0.12 0.88, -0.02 0.7, 0.03 0.5 C 0.07 0.3, 0.02 0.15, 0.18 0.06 C 0.32 -0.01, 0.38 0.04, 0.5 0.02 Z',
  // Shape B — tall left curve, diagonal cut top-right
  'M 0.45 0.03 C 0.7 -0.03, 0.98 0.08, 0.95 0.3 C 0.93 0.48, 0.97 0.68, 0.88 0.88 C 0.78 1.04, 0.5 1.03, 0.32 0.97 C 0.15 0.91, 0.0 0.75, 0.04 0.55 C 0.08 0.38, 0.0 0.2, 0.12 0.1 C 0.24 0.0, 0.3 0.06, 0.45 0.03 Z',
  // Shape C — pinched top, wide organic bottom
  'M 0.48 0.04 C 0.68 0.0, 0.88 0.1, 0.93 0.28 C 0.98 0.46, 0.94 0.7, 0.82 0.9 C 0.7 1.06, 0.42 1.04, 0.25 0.96 C 0.08 0.88, -0.02 0.65, 0.05 0.45 C 0.1 0.28, 0.05 0.14, 0.2 0.06 C 0.33 -0.01, 0.38 0.06, 0.48 0.04 Z',
  // Shape D — asymmetric mango: deep left curve, straighter right
  'M 0.5 0.03 C 0.72 -0.02, 0.96 0.15, 0.94 0.38 C 0.92 0.58, 0.96 0.72, 0.84 0.9 C 0.7 1.06, 0.4 1.0, 0.22 0.94 C 0.05 0.86, -0.04 0.62, 0.06 0.42 C 0.14 0.25, 0.04 0.12, 0.22 0.05 C 0.35 0.0, 0.4 0.05, 0.5 0.03 Z',
  // Shape E — rotated capsule feel, uneven edges
  'M 0.52 0.02 C 0.78 -0.03, 0.97 0.18, 0.9 0.4 C 0.84 0.58, 0.92 0.78, 0.78 0.93 C 0.62 1.06, 0.35 1.02, 0.2 0.92 C 0.05 0.82, -0.02 0.58, 0.08 0.38 C 0.16 0.2, 0.06 0.08, 0.25 0.03 C 0.38 -0.02, 0.4 0.04, 0.52 0.02 Z',
];

export default function FancyCards({
  images,
  className = '',
  cardWidth = 'clamp(120px, 20vmin, 200px)',
}: FancyCardsProps) {
  const cardsCount = images.length;
  const middle = (cardsCount - 1) / 2;
  const baseCardWidth = cardWidth;

  return (
    <div
      className={`relative flex justify-center items-end w-full overflow-visible ${className}`}
      style={{ height: 'clamp(260px, 40vmin, 420px)' }}
    >
      {/* Hidden SVG definitions for organic blob clip-paths */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {BLOB_PATHS.map((d, idx) => (
            <clipPath
              key={idx}
              id={`blob-shape-${idx}`}
              clipPathUnits="objectBoundingBox"
            >
              <path d={d} />
            </clipPath>
          ))}
        </defs>
      </svg>

      <style dangerouslySetInnerHTML={{
        __html: `
          .fancy-card-wrapper {
            position: absolute;
            transition: transform 0.45s cubic-bezier(0.22, 0.68, 0, 1.02), z-index 0s;
            transform-origin: 50% 300%;
          }
          .fancy-card-wrapper:hover {
            z-index: 50 !important;
            transform: rotate(0deg) scale(1.12) !important;
          }

          /* Organic blob container — uses drop-shadow since
             box-shadow doesn't follow clip-path boundaries */
          .fancy-blob-container {
            position: relative;
            width: 100%;
            aspect-ratio: 4 / 6;
            transition: filter 0.3s ease;
            filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.35));
          }
          .fancy-card-wrapper:hover .fancy-blob-container {
            filter: drop-shadow(0 16px 36px rgba(0, 0, 0, 0.45));
          }

          .fancy-blob-img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
          }
        `
      }} />

      {images.map((img, i) => {
        const offset = i - middle;
        const rotation = offset * 13;
        const zIndex = cardsCount - Math.abs(offset);
        const shapeIdx = i % BLOB_PATHS.length;

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
                style={{ clipPath: `url(#blob-shape-${shapeIdx})` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
