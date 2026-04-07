/**
 * Fly-to-Cart Animation
 *
 * Clones the product image, positions it at the source location,
 * and animates it flying (shrinking + moving) to the cart icon
 * in the header. Works on both desktop and mobile cart icons.
 *
 * Accepts either an HTMLElement directly or an element ID string
 * for backward compatibility.
 */

export function flyToCart(source: HTMLElement | string): void {
  const sourceImage =
    typeof source === 'string'
      ? (document.getElementById(source) as HTMLElement | null)
      : source;

  // Find the visible cart icon (desktop or mobile)
  const cartIcons = document.querySelectorAll<HTMLElement>('[data-cart-icon]');
  let cartIcon: HTMLElement | null = null;

  for (const icon of cartIcons) {
    const rect = icon.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      cartIcon = icon;
      break;
    }
  }

  if (!sourceImage || !cartIcon) return;

  const sourceRect = sourceImage.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  // Clone the source element
  const clone = sourceImage.cloneNode(true) as HTMLElement;

  // Remove any IDs to avoid duplicates
  clone.removeAttribute('id');

  // Style the clone for animation — start scaled up so it's big and visible
  const startWidth = Math.min(sourceRect.width * 1.3, 280);
  const startHeight = Math.min(sourceRect.height * 1.3, 280);
  const offsetX = (startWidth - sourceRect.width) / 2;
  const offsetY = (startHeight - sourceRect.height) / 2;

  Object.assign(clone.style, {
    position: 'fixed',
    top: `${sourceRect.top - offsetY}px`,
    left: `${sourceRect.left - offsetX}px`,
    width: `${startWidth}px`,
    height: `${startHeight}px`,
    zIndex: '10000',
    pointerEvents: 'none',
    borderRadius: '16px',
    objectFit: 'cover',
    transition: 'all 0.85s cubic-bezier(0.2, 0.8, 0.2, 1)',
    transformOrigin: 'center center',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    margin: '0',
    padding: '0',
  });

  document.body.appendChild(clone);

  // Force a reflow so the starting position is committed
  void clone.offsetHeight;

  // Calculate the target center — end at 50px so it's still visible on arrival
  const endSize = 50;
  const targetX = cartRect.left + cartRect.width / 2 - endSize / 2;
  const targetY = cartRect.top + cartRect.height / 2 - endSize / 2;

  // Animate to the cart icon
  Object.assign(clone.style, {
    top: `${targetY}px`,
    left: `${targetX}px`,
    width: `${endSize}px`,
    height: `${endSize}px`,
    opacity: '0.7',
    borderRadius: '50%',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
  });

  // Bounce the cart icon when clone arrives, then clean up
  clone.addEventListener(
    'transitionend',
    () => {
      clone.remove();

      // Pulse the cart icon
      cartIcon!.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      cartIcon!.style.transform = 'scale(1.25)';
      setTimeout(() => {
        cartIcon!.style.transform = 'scale(1)';
      }, 300);
    },
    { once: true },
  );

  // Safety: remove clone after timeout in case transitionend doesn't fire
  setTimeout(() => {
    if (clone.parentNode) clone.remove();
  }, 1200);
}
