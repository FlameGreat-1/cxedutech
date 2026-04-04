import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  Shipping Highlight Card                                            */
/* ------------------------------------------------------------------ */

function HighlightCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Policy Section                                                     */
/* ------------------------------------------------------------------ */

function PolicySection({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-mood-sage/50">
          <svg
            className="w-5 h-5 text-mood-toke-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shipping Page                                                      */
/* ------------------------------------------------------------------ */

export default function ShippingPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* \u2500\u2500 Hero Banner \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-mood-sage/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-6">
            <img
              src="/icons/shipping.png"
              alt=""
              className="w-8 h-8"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Shipping & Returns
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about delivery times, shipping costs, and our return policy.
          </p>

          {/* Quick nav */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#delivery"
              className="px-4 py-2 text-sm font-medium text-mood-toke-green bg-white border border-gray-200 rounded-lg hover:border-mood-toke-green hover:shadow-sm transition-all"
            >
              Delivery
            </a>
            <a
              href="#turnaround"
              className="px-4 py-2 text-sm font-medium text-mood-toke-green bg-white border border-gray-200 rounded-lg hover:border-mood-toke-green hover:shadow-sm transition-all"
            >
              Turnaround
            </a>
            <a
              href="#returns"
              className="px-4 py-2 text-sm font-medium text-mood-toke-green bg-white border border-gray-200 rounded-lg hover:border-mood-toke-green hover:shadow-sm transition-all"
            >
              Returns & Exchanges
            </a>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 Highlight Cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <HighlightCard
            icon={
              <svg className="w-7 h-7 text-mood-toke-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.25m0 0V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25" />
              </svg>
            }
            title="Tracked Delivery"
            description="All orders shipped via EasyPost with full tracking provided."
            accent="rgba(190, 199, 232, 0.3)"
          />
          <HighlightCard
            icon={
              <svg className="w-7 h-7 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            }
            title="Competitive Rates"
            description="Real-time carrier rates calculated at checkout based on your address and order."
            accent="rgba(249, 115, 22, 0.1)"
          />
          <HighlightCard
            icon={
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            }
            title="14-Day Returns"
            description="Changed your mind? Request a refund within 14 days of receiving your goods."
            accent="rgba(14, 165, 233, 0.1)"
          />
        </div>
      </section>

      {/* \u2500\u2500 Policy Sections \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">

        {/* Delivery */}
        <PolicySection
          id="delivery"
          icon="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.25m0 0V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25"
          title="Delivery"
        >
          <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
            All of our goods are shipped via <strong>EasyPost</strong> with tracked delivery. Shipping costs are calculated dynamically at checkout based on your delivery address, order weight, and available carrier options.
          </p>

          {/* How it works */}
          <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-50 px-5 py-3">
              <h3 className="text-sm font-semibold text-gray-900">How Shipping Costs Work</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-mood-toke-green text-white text-xs font-bold shrink-0 mt-0.5">1</span>
                <p className="text-sm text-gray-700">Enter your shipping address during checkout.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-mood-toke-green text-white text-xs font-bold shrink-0 mt-0.5">2</span>
                <p className="text-sm text-gray-700">We fetch real-time rates from our shipping carriers based on your address and order weight.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-mood-toke-green text-white text-xs font-bold shrink-0 mt-0.5">3</span>
                <p className="text-sm text-gray-700">Choose from available delivery options (e.g. Standard, Express) with clear pricing and estimated delivery times.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-mood-toke-green text-white text-xs font-bold shrink-0 mt-0.5">4</span>
                <p className="text-sm text-gray-700">Your selected shipping cost is added to your order total before payment. No hidden fees.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> We currently ship within the United Kingdom only. International shipping is coming soon.
            </p>
          </div>
        </PolicySection>

        {/* Turnaround */}
        <PolicySection
          id="turnaround"
          icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          title="Turnaround Time"
        >
          <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
            Our current turnaround time is <strong>3\u20137 working days</strong>. This is the time it takes to process and prepare your order and does not include delivery time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-mood-toke-green">3\u20137</p>
              <p className="text-sm text-gray-600 mt-1">Working days processing</p>
            </div>
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <div className="flex-1 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-mood-blue">2\u20133</p>
              <p className="text-sm text-gray-600 mt-1">Working days delivery</p>
            </div>
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <div className="flex-1 p-4 bg-brand-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-accent-600">5\u201310</p>
              <p className="text-sm text-gray-600 mt-1">Total working days</p>
            </div>
          </div>
        </PolicySection>

        {/* Returns & Exchanges */}
        <PolicySection
          id="returns"
          icon="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
          title="Return & Exchange Policy"
        >
          <div className="space-y-6">
            {/* Standard returns */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Standard Returns</h3>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                If you change your mind about an order you can request a refund within <strong>14 days</strong> of receiving your goods by emailing{' '}
                <a href="mailto:inflexatechnologies@gmail.com" className="text-mood-toke-green font-medium hover:underline">
                  inflexatechnologies@gmail.com
                </a>{' '}
                with your order number and the reason you wish to return the item.
              </p>
            </div>

            {/* Return process */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Refund Process</h3>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                You will be responsible for all postage costs to return the item. When we have received and inspected the items, a refund will be issued within <strong>10 business days</strong> and money will be returned through the original payment method. Processing times may vary by payment provider.
              </p>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-mood-toke-green text-white text-xs font-bold shrink-0">1</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Email Us</p>
                    <p className="text-xs text-gray-500 mt-0.5">Include order number and reason</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-mood-toke-green text-white text-xs font-bold shrink-0">2</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Return Items</p>
                    <p className="text-xs text-gray-500 mt-0.5">Post items back at your cost</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-mood-toke-green text-white text-xs font-bold shrink-0">3</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Receive Refund</p>
                    <p className="text-xs text-gray-500 mt-0.5">Within 10 business days of receipt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalised items */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Personalised Items</p>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                  We do not offer refunds or exchanges on personalised learning items unless they are faulty or incorrect on delivery. If this is the case, please email{' '}
                  <a href="mailto:inflexatechnologies@gmail.com" className="font-medium underline">
                    inflexatechnologies@gmail.com
                  </a>{' '}
                  with a photograph of the fault and we will be happy to provide a replacement or a full refund.
                </p>
              </div>
            </div>

            {/* Damaged items */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Damaged or Faulty Items</h3>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                If your order arrives damaged or faulty, please contact us within <strong>48 hours of delivery</strong> at{' '}
                <a href="mailto:inflexatechnologies@gmail.com" className="text-mood-toke-green font-medium hover:underline">
                  inflexatechnologies@gmail.com
                </a>{' '}
                with your order number and a photograph of the damage. We will arrange a replacement or full refund at no extra cost to you.
              </p>
            </div>
          </div>
        </PolicySection>
      </div>

      {/* \u2500\u2500 Bottom CTA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Have more questions?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Check our FAQs for quick answers or get in touch with our team directly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/faqs"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-mood-toke-green text-white text-[15px] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              View FAQs
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-[15px] font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
