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
        `
      }} />

      {images.map((img, i) => {
        const offset = i - middle;

        // ~13 degrees per card step — matches the reference arc spread
        const rotation = offset * 13;

        // Center card is highest z-index; outer cards go underneath
        const zIndex = cardsCount - Math.abs(offset);

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
            <div className="w-full aspect-[4/6] rounded-[12px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] bg-white overflow-hidden hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] transition-shadow duration-300">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover pointer-events-none rounded-[inherit]"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
