import { useMemo } from 'react';

export interface FancyCard {
  src: string;
  alt: string;
}

export interface FancyCardsProps {
  /** Array of image objects to display */
  images: FancyCard[];
  /** Container class name */
  className?: string;
  /** Width of each card using valid CSS sizing */
  cardWidth?: string;
  /** Radius of the circular formation path */
  radius?: string;
  /** Total length of the arc layout (e.g. 0.25 is a quarter circle) */
  arcSize?: number;
  /** The center focus point of the arc (0.75 is the top of a standard offset-path circle) */
  arcCenter?: number;
  /** Distance neighbor cards shift aside when hovering */
  arcShiftDelta?: number;
  /** Offset anchor shift when a card is hovered to push it upwards/outwards */
  hoverAnchor?: string;
  /** Height of the visible area that contains the arc */
  containerHeight?: string;
}

export default function FancyCards({
  images,
  className = '',
  cardWidth = 'clamp(120px, 20vmin, 200px)',
  radius = 'clamp(250px, 50vmin, 450px)',
  arcSize = 0.25,
  arcCenter = 0.75,
  arcShiftDelta = 0.015,
  hoverAnchor = '50% 10%',
  containerHeight = 'clamp(300px, 45vmin, 450px)',
}: FancyCardsProps) {
  const cardsCount = images.length;

  const dynamicStyles = useMemo(() => {
    let styles = '';
    for (let i = 0; i < cardsCount; i++) {
      const distFromCenter = Math.abs(Math.floor(cardsCount / 2) - i);
      const zIndex = cardsCount - distFromCenter;
      styles += `
        .fancy-cards-wrapper > div:nth-child(${i + 1}) {
          --card-i: ${i + 1};
          z-index: ${zIndex};
        }
      `;
    }
    return styles;
  }, [cardsCount]);

  return (
    <div
      className={`relative w-full max-w-full ${className}`}
      style={{ height: containerHeight }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .fancy-cards-wrapper {
            --card-trans-duration: 800ms;
            --card-trans-easing: linear(
              0, 0.01 0.8%, 0.038 1.6%, 0.154 3.4%, 0.781 9.7%, 1.01 12.5%,
              1.089 13.8%, 1.153 15.2%, 1.195 16.6%, 1.219 18%, 1.224 19.7%,
              1.208 21.6%, 1.172 23.6%, 1.057 28.6%, 1.007 31.2%, 0.969 34.1%,
              0.951 37.1%, 0.953 40.9%, 0.998 50.4%, 1.011 56%, 0.998 74.7%, 1
            );
            --card-border-radius: 12px;
            --card-width: ${cardWidth};
            --radius: ${radius};
            --cards: ${cardsCount};
            --arc-size: ${arcSize};
            --arc-center: ${arcCenter};
            --arc-start: calc(var(--arc-center) - var(--arc-size) / 2);
            --arc-shift: 0;
            --arc-shift-delta: ${arcShiftDelta};

            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: var(--card-width);
            aspect-ratio: 4 / 6;
          }

          .fancy-cards-wrapper > div {
            --card-i: 1;
            --arc-step: calc(var(--arc-size) / calc(var(--cards) - 1));

            position: absolute;
            width: var(--card-width);
            aspect-ratio: 4 / 6;
            background: white;
            border-radius: var(--card-border-radius);
            box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);

            offset-path: circle(var(--radius) at 50% 100%);
            offset-distance: calc(
              (var(--arc-start)
               + (var(--card-i) - 1) * var(--arc-step)
               + var(--arc-shift)
              ) * 100%
            );

            offset-rotate: auto;
            offset-anchor: 50% 0%;
            transition: all var(--card-trans-duration) var(--card-trans-easing);
          }

          ${dynamicStyles}

          .fancy-cards-wrapper > div:hover {
            offset-anchor: ${hoverAnchor};
            z-index: 50;
            box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6);
          }

          .fancy-cards-wrapper > div:hover + div {
            --arc-shift: calc(var(--arc-shift-delta) * 3);
          }
          .fancy-cards-wrapper > div:hover + div + div {
            --arc-shift: calc(var(--arc-shift-delta) * 2);
          }
          .fancy-cards-wrapper > div:hover + div + div + div {
            --arc-shift: calc(var(--arc-shift-delta) * 1);
          }

          .fancy-cards-wrapper > div:has(+ div:hover) {
            --arc-shift: calc(var(--arc-shift-delta) * -3);
          }
          .fancy-cards-wrapper > div:has(+ div + div:hover) {
            --arc-shift: calc(var(--arc-shift-delta) * -2);
          }
          .fancy-cards-wrapper > div:has(+ div + div + div:hover) {
            --arc-shift: calc(var(--arc-shift-delta) * -1);
          }

          .fancy-cards-wrapper > div > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            border-radius: inherit;
            pointer-events: none;
          }
        `
      }} />
      <div className="fancy-cards-wrapper">
        {images.map((img, idx) => (
          <div key={idx} className="cursor-pointer">
            <img src={img.src} alt={img.alt} loading="lazy" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
