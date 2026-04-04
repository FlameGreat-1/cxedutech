import { useState } from 'react';

interface HelpItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  name: string;
  icon: string;
  items: HelpItem[];
}

const HELP_DATA: HelpCategory[] = [
  {
    name: 'Order Management',
    icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z',
    items: [
      {
        question: 'What are the order statuses and what do they mean?',
        answer: 'Orders follow a strict lifecycle:\n\n\u2022 Pending: Order created, awaiting payment.\n\u2022 Paid: Payment confirmed via Stripe or Paystack webhook.\n\u2022 Shipped: Order dispatched (automatically via EasyPost or manually by admin).\n\u2022 Delivered: Order confirmed as delivered to the customer.\n\u2022 Cancelled: Order cancelled (inventory is automatically restored).\n\nAllowed transitions: Pending \u2192 Paid \u2192 Shipped \u2192 Delivered. Any status except Delivered can transition to Cancelled.',
      },
      {
        question: 'How does automatic shipping work after payment?',
        answer: 'When EasyPost shipping is enabled in Settings > Shipping and a payment succeeds (via Stripe or Paystack webhook), the system automatically:\n\n1. Updates the order status to Paid.\n2. Creates an EasyPost shipment using the customer\u2019s shipping address.\n3. Selects the cheapest available carrier rate and purchases the shipping label.\n4. Saves the tracking code to the order.\n5. Updates the order status to Shipped.\n6. Sends a shipping confirmation email to the customer with the tracking code.\n\nThe cheapest rate is used consistently: the same approach is applied at checkout (to calculate the shipping cost charged to the customer) and after payment (to purchase the actual label). If auto-shipping fails for any reason, the order remains in Paid status and you can retry from the order detail page or the Unshipped Orders page.',
      },
      {
        question: 'How do I ship an order manually?',
        answer: 'When EasyPost shipping is disabled in Settings > Shipping, you handle shipping yourself. After payment is confirmed:\n\n1. Go to the Unshipped Orders page or the specific order detail page.\n2. Change the order status to Shipped using the status dropdown.\n3. The system automatically generates a tracking code in the format INF-TRK-{orderId}-{randomHex}.\n4. A shipping confirmation email is sent to the customer with this tracking code.\n\nYou can also click the "Ship Order" button on the order detail page, but this requires EasyPost to be enabled. For manual shipping, simply update the status to Shipped.',
      },
      {
        question: 'How are tracking codes generated?',
        answer: 'Tracking codes are generated in two ways:\n\n\u2022 Automatic (EasyPost enabled): The tracking code comes directly from the shipping carrier (e.g. Royal Mail, DHL) when the label is purchased through EasyPost.\n\u2022 Manual (EasyPost disabled): When you change an order status to Shipped and no tracking code exists, the system auto-generates one in the format INF-TRK-{orderId}-{randomHex} (e.g. INF-TRK-42-A3F1B2).\n\nIn both cases, the tracking code is included in the shipping confirmation email sent to the customer.',
      },
      {
        question: 'What happens to stale pending orders?',
        answer: 'The system runs an automatic cleanup job that cancels pending orders that have not been paid within the configured time window (default: 24 hours). When an order is auto-cancelled:\n\n\u2022 The reserved inventory is restored to the product stock.\n\u2022 The idempotency key is cleared so the customer can place a new order.\n\u2022 The order status is set to Cancelled.\n\nThe cleanup interval and max age are configurable via environment variables (ORDER_CLEANUP_MAX_AGE_HOURS and ORDER_CLEANUP_INTERVAL_MINUTES).',
      },
      {
        question: 'How do I export orders to CSV?',
        answer: 'Go to the Orders page and click the "Export CSV" button in the top right. This downloads a CSV file containing all orders with full details including order ID, customer name, email, subtotal, shipping cost, shipping carrier, shipping service, tax amount, tax rate, total amount, currency, status, shipping address, tracking code, and creation date.',
      },
      {
        question: 'What is the difference between the Unshipped and Shipped pages?',
        answer: 'The Unshipped Orders page shows all orders that are in Paid status but have not yet been shipped (no EasyPost shipment ID). This is your fulfilment queue. The Shipped Orders page shows all orders that are in Shipped or Delivered status. Use these pages to quickly manage your fulfilment workflow without scrolling through all orders.',
      },
    ],
  },
  {
    name: 'Product Management',
    icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
    items: [
      {
        question: 'How do I create a new product?',
        answer: 'Go to the Products page and click "Add Product". Fill in all required fields: title, description, age range (min/max), subject, focus area, price, currency, format (physical or printable), and inventory count. You can also add "What\'s Included" items and upload up to 5 product images. Click "Create Product" to save.',
      },
      {
        question: 'How do product images work?',
        answer: 'Each product can have up to 5 images. Supported formats are JPEG, PNG, WebP, GIF, and AVIF. You can:\n\n\u2022 Upload images by clicking the upload area or dragging and dropping files.\n\u2022 Set a primary image by hovering over an image and clicking the star icon. The primary image is shown first in the product listing.\n\u2022 Delete images by hovering and clicking the X icon.\n\nImages are stored on the server in the /uploads directory and served statically.',
      },
      {
        question: 'How does inventory management work?',
        answer: 'Each product has an inventory_count field that tracks available stock. When a customer places an order:\n\n\u2022 Stock is reserved immediately (decremented within a database transaction).\n\u2022 If the order is cancelled (manually or by auto-cleanup), the reserved stock is restored.\n\u2022 If stock is insufficient, the order is rejected with a clear error message.\n\nYou can update inventory count directly from the product edit form.',
      },
      {
        question: 'What are the stock alerts on the dashboard?',
        answer: 'The Dashboard shows two types of stock alerts:\n\n\u2022 Out of Stock (red): Products with inventory_count = 0. These cannot be ordered.\n\u2022 Low Stock (yellow): Products with inventory_count between 1 and 4. These are running low and should be restocked soon.\n\nMonitor these alerts regularly to avoid missed sales.',
      },
    ],
  },
  {
    name: 'Payments',
    icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
    items: [
      {
        question: 'How do Stripe and Paystack payments work?',
        answer: 'Both payment providers follow the same flow:\n\n1. Customer creates an order (Pending status).\n2. Frontend requests a payment session (Stripe PaymentIntent or Paystack transaction).\n3. Customer completes payment on the provider\'s secure form.\n4. The provider sends a webhook to your server confirming payment success.\n5. The server updates the payment record to "completed" and the order to "Paid".\n6. Order confirmation email is sent and auto-shipping is triggered (if enabled).\n\nWebhooks are the source of truth for payment confirmation, not the frontend redirect.',
      },
      {
        question: 'What do the payment statuses mean?',
        answer: '\u2022 Pending: Payment session created, customer has not completed payment yet.\n\u2022 Completed: Payment confirmed by the provider webhook. Order is updated to Paid.\n\u2022 Failed: Payment was declined or failed. The order remains in Pending status and the customer can retry.',
      },
      {
        question: 'How do I view payment details?',
        answer: 'Go to the Payments page to see all payment records. Click on any payment to view full details including: amount, currency, provider (Stripe/Paystack), payment method, status, Stripe Intent ID or Paystack reference, linked order details, customer information, and order items.',
      },
    ],
  },
  {
    name: 'Settings',
    icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z',
    items: [
      {
        question: 'How do I configure payment gateways?',
        answer: 'Go to Settings > Payment Gateways. For each provider (Stripe and Paystack):\n\n\u2022 Toggle: Enable or disable the gateway. When disabled, customers cannot use that payment method.\n\u2022 Currency: Set the currency for transactions (e.g. GBP, USD, NGN).\n\u2022 Public Key: The publishable/public key used by the frontend checkout form.\n\u2022 Secret Key: The server-side secret key for API calls. Never exposed to the frontend.\n\u2022 Webhook Secret: Used to verify incoming webhook signatures from the payment provider.\n\nKeys are stored encrypted in the database. The dashboard shows masked versions for security.',
      },
      {
        question: 'How do I configure shipping?',
        answer: 'Go to Settings > Shipping. The default provider is EasyPost.\n\n\u2022 Toggle ON: Shipping costs are fetched dynamically from EasyPost at checkout. The system automatically selects the cheapest available carrier rate, applies it to the order total, and displays it in the order summary. After payment, the system auto-ships using EasyPost with the cheapest rate.\n\u2022 Toggle OFF: Shipping cost defaults to \u00a30.00. No EasyPost API calls are made. You handle shipping manually outside the system. When you update an order to Shipped, a tracking code is auto-generated.\n\nYou need to enter your EasyPost API key for automatic shipping to work.',
      },
      {
        question: 'How do I configure tax (VAT)?',
        answer: 'Go to Settings > Tax. The default configuration is UK VAT at 20%.\n\n\u2022 Toggle ON: The configured tax rate is automatically applied to the order subtotal during checkout. The tax amount is shown in the order summary, confirmation page, and email receipt.\n\u2022 Toggle OFF: Tax defaults to \u00a30.00. No tax is charged to the customer. You can calculate and handle tax manually for your own accounting/HMRC filing.\n\nYou can also change the tax label (e.g. "VAT", "GST", "Sales Tax") and the rate (0-100%).',
      },
      {
        question: 'What happens when both shipping and tax are disabled?',
        answer: 'When both are disabled, the customer pays only the product subtotal. The order records shipping_cost = 0 and tax_amount = 0. The total_amount equals the subtotal. This is useful during initial setup or if you prefer to handle shipping and tax outside the system. The application will not crash regardless of the toggle state.',
      },
      {
        question: 'How do I change my admin password?',
        answer: 'Go to Settings > Change Password. Enter your current password, then your new password (minimum 8 characters, at least one uppercase letter and one number), and confirm it. Click "Update Password" to save.',
      },
    ],
  },
  {
    name: 'Guest vs Authenticated Orders',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    items: [
      {
        question: 'How do guest checkout orders appear in the dashboard?',
        answer: 'Guest orders have user_id = null and show "Guest checkout" in the order detail page instead of an account username. The customer\'s name and email come from the shipping address they entered during checkout. Guest orders are fully functional: they receive confirmation emails, shipping emails, and can be tracked via the guest order lookup page.',
      },
      {
        question: 'What is the difference between guest and registered user orders?',
        answer: 'The only differences are:\n\n\u2022 Guest orders are not linked to a user account (user_id is null).\n\u2022 Guest customers track orders via the Guest Order Lookup page using their order number and email.\n\u2022 Registered users track orders via their Account > Orders page.\n\nFrom an admin perspective, both types are managed identically. You can update status, ship, and export both types the same way.',
      },
    ],
  },
  {
    name: 'Search & General',
    icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
    items: [
      {
        question: 'How does the admin search work?',
        answer: 'The search bar at the top of the admin dashboard searches across three entities simultaneously:\n\n\u2022 Orders: by order ID, customer name, email, tracking code, or EasyPost shipment ID.\n\u2022 Products: by title, subject, focus area, format, description, or age range.\n\u2022 Payments: by payment ID, Paystack reference, Stripe intent ID, or customer name.\n\nResults are returned instantly (max 5 per category) and link directly to the detail pages.',
      },
      {
        question: 'How does the checkout flow work end to end?',
        answer: '1. Customer adds items to cart and proceeds to checkout.\n2. Customer fills in shipping address.\n3. Order is created. If shipping is enabled, the system fetches rates from EasyPost and automatically applies the cheapest rate. If shipping is disabled, shipping cost = \u00a30. Tax is applied if enabled.\n4. The order total (subtotal + shipping + tax) is shown in the order summary.\n5. Customer selects payment method (Stripe or Paystack) and completes payment.\n6. Webhook confirms payment. Order moves to Paid. Confirmation email sent.\n7. If EasyPost enabled: auto-ships with cheapest rate and sends shipping email. If disabled: admin ships manually later.',
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: HelpItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-admin-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 px-1 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-admin-text group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug pr-2">
          {item.question}
        </span>
        <span
          className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? 'bg-brand-600 text-white rotate-180'
              : 'bg-admin-hover text-admin-muted group-hover:bg-admin-border'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[800px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-1 text-sm text-admin-muted leading-relaxed whitespace-pre-line">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export default function AdminHelpPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  function toggleItem(key: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const displayData = activeCategory
    ? HELP_DATA.filter((cat) => cat.name === activeCategory)
    : HELP_DATA;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-admin-text">Help & FAQs</h1>
        <p className="text-sm text-admin-muted mt-1">Quick answers to common admin dashboard questions.</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !activeCategory
              ? 'bg-brand-600 text-white'
              : 'bg-admin-hover text-admin-muted hover:text-admin-text'
          }`}
        >
          All ({HELP_DATA.reduce((sum, cat) => sum + cat.items.length, 0)})
        </button>
        {HELP_DATA.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory((prev) => (prev === cat.name ? null : cat.name))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === cat.name
                ? 'bg-brand-600 text-white'
                : 'bg-admin-hover text-admin-muted hover:text-admin-text'
            }`}
          >
            {cat.name} ({cat.items.length})
          </button>
        ))}
      </div>

      {/* FAQ sections */}
      <div className="space-y-8">
        {displayData.map((category) => (
          <div key={category.name}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-admin-hover">
                <svg
                  className="w-4 h-4 text-brand-600 dark:text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={category.icon} />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-admin-text">{category.name}</h2>
            </div>

            <div className="bg-admin-bg rounded-xl border border-admin-border px-5 transition-colors">
              {category.items.map((item, idx) => {
                const key = `${category.name}-${idx}`;
                return (
                  <AccordionItem
                    key={key}
                    item={item}
                    isOpen={openItems.has(key)}
                    onToggle={() => toggleItem(key)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}