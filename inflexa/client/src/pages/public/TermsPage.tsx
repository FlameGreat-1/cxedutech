import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 text-[15px] text-gray-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Info card (company details)                                        */
/* ------------------------------------------------------------------ */

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Terms & Conditions Page                                            */
/* ------------------------------------------------------------------ */

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-mood-sage/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-6">
            <svg
              className="w-8 h-8 text-mood-toke-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            The terms that govern your use of the Inflexa website and the
            purchase of our products.
          </p>
          <p className="mt-3 text-sm text-gray-400">Last Updated: 15/02/2026</p>

          {/* Quick nav */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { href: '#eligibility', label: 'Eligibility' },
              { href: '#ordering', label: 'Ordering' },
              { href: '#returns', label: 'Returns' },
              { href: '#liability', label: 'Liability' },
              { href: '#governing-law', label: 'Governing Law' },
              { href: '#contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="px-4 py-2 text-sm font-medium text-mood-toke-green bg-white border border-gray-200 rounded-lg hover:border-mood-toke-green hover:shadow-sm transition-all"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Important notice banner ────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <svg
            className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <p className="text-sm text-blue-800 leading-relaxed">
            By accessing our website or placing an order, you agree to these
            Terms &amp; Conditions. If you do not agree, please do not use our
            services.
          </p>
        </div>
      </section>

      {/* ── Terms content ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">

        {/* 1. Introduction */}
        <Section id="introduction" title="1. Introduction">
          <p>
            These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use
            of the <strong>Inflexa Technologies</strong> website and the
            purchase of products from{' '}
            <strong>Inflexa Technologies Limited</strong> (&ldquo;Inflexa&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
          </p>
        </Section>

        {/* 2. Company Information */}
        <Section id="company" title="2. Company Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard label="Company">
              <p className="font-medium text-gray-900">Inflexa Technologies Limited</p>
            </InfoCard>
            <InfoCard label="Registered Office">
              <p>128 City Road, London, EC1V 2NX, United Kingdom</p>
            </InfoCard>
            <InfoCard label="Email">
              <a
                href="mailto:support@inflexatechnologies.com"
                className="text-mood-toke-green font-medium hover:underline"
              >
                support@inflexatechnologies.com
              </a>
            </InfoCard>
            <InfoCard label="Website">
              <p>inflexatechnologies.co.uk &amp; inflexatechnologies.com</p>
            </InfoCard>
          </div>
        </Section>

        {/* 3. Eligibility */}
        <Section id="eligibility" title="3. Eligibility to Use Our Services">
          <p>You must be at least <strong>18 years old</strong> to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Place an order</li>
            <li>Create an account</li>
            <li>Enter into a contract with us</li>
          </ul>
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <svg
              className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm text-amber-700 leading-relaxed">
              Our products are designed for children aged 3&ndash;8, but all
              purchases must be made by a parent, guardian, or authorised adult.
            </p>
          </div>
        </Section>

        {/* 4. Products & Descriptions */}
        <Section id="products" title="4. Products & Descriptions">
          <p>
            We make every effort to ensure product descriptions, images, and
            information are accurate. However:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>
              Illustrations and colours may vary slightly due to printing or
              screen differences.
            </li>
            <li>
              Product content is educational but does not guarantee specific
              learning outcomes.
            </li>
          </ul>
          <p className="text-sm text-gray-600">
            We reserve the right to update or discontinue products without
            notice.
          </p>
        </Section>

        {/* 5. Ordering & Contract Formation */}
        <Section id="ordering" title="5. Ordering & Contract Formation">
          <p>An order is considered accepted when:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Payment is successfully processed, and</li>
            <li>You receive an order confirmation email.</li>
          </ul>
          <p>We reserve the right to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Refuse or cancel orders</li>
            <li>Limit quantities</li>
            <li>Correct pricing or description errors</li>
          </ul>
          <div className="flex items-center gap-3 p-4 bg-mood-toke-green/5 rounded-xl border border-mood-toke-green/20">
            <svg
              className="w-5 h-5 text-mood-toke-green shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-mood-toke-green">
              If an order is cancelled after payment, a full refund will be
              issued.
            </p>
          </div>
        </Section>

        {/* 6. Pricing & Payments */}
        <Section id="pricing" title="6. Pricing & Payments">
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>All prices are displayed in GBP / USD / NGN.</li>
            <li>
              Prices may include or exclude taxes depending on your location.
            </li>
            <li>Shipping costs are displayed at checkout.</li>
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <svg
                className="w-5 h-5 text-mood-toke-green shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                Payments processed securely via third-party providers
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <svg
                className="w-5 h-5 text-mood-toke-green shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                We do not store your payment details
              </p>
            </div>
          </div>
        </Section>

        {/* 7. Delivery & Shipping */}
        <Section id="delivery" title="7. Delivery & Shipping">
          <p>
            We aim to dispatch orders within the timeframe stated at checkout.
            Please note:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Delivery times are estimates, not guarantees.</li>
            <li>
              International orders may be subject to customs duties or taxes,
              which are the customer&rsquo;s responsibility.
            </li>
            <li>
              Inflexa is not responsible for delays caused by customs, postal
              services, or external events.
            </li>
          </ul>
          <p className="text-sm text-gray-600">
            For full delivery information, see our{' '}
            <Link
              to="/shipping"
              className="text-mood-toke-green font-medium hover:underline"
            >
              Shipping &amp; Returns
            </Link>{' '}
            page.
          </p>
        </Section>

        {/* 8. Returns, Refunds & Cancellations */}
        <Section id="returns" title="8. Returns, Refunds & Cancellations">
          <p>
            Our Returns &amp; Refunds Policy forms part of these Terms. Key
            points:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>
              Customers may cancel orders within{' '}
              <strong>14 days of receipt</strong> (where applicable by law).
            </li>
            <li>Products must be returned unused and in original condition.</li>
            <li>
              Refunds are processed once returned items are received and
              inspected.
            </li>
            <li>Faulty or damaged items will be replaced or refunded.</li>
          </ul>
          <p className="text-sm text-gray-600">
            For full details, see our{' '}
            <Link
              to="/shipping"
              className="text-mood-toke-green font-medium hover:underline"
            >
              Shipping &amp; Returns
            </Link>{' '}
            page.
          </p>
        </Section>

        {/* 9. Use of Website */}
        <Section id="website-use" title="9. Use of Website">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Misuse the website</li>
            <li>Attempt unauthorised access</li>
            <li>Copy or scrape content</li>
            <li>Disrupt site functionality</li>
          </ul>
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
            <svg
              className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm text-red-700">
              We may suspend or terminate access if these Terms are breached.
            </p>
          </div>
        </Section>

        {/* 10. Intellectual Property */}
        <Section id="ip" title="10. Intellectual Property">
          <p>
            All content on the website and in our products is the intellectual
            property of <strong>Inflexa Technologies Limited</strong>, including:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Text',
              'Illustrations',
              'Flashcard designs',
              'PDFs',
              'Branding',
              'Logos',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl"
              >
                <svg
                  className="w-4 h-4 text-mood-toke-green shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700">{item}</p>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
            <svg
              className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            <p className="text-sm text-red-700">
              You may not copy, reproduce, distribute, or resell our materials
              without written permission.
            </p>
          </div>
        </Section>

        {/* 11. Educational Disclaimer */}
        <Section id="disclaimer" title="11. Educational Disclaimer">
          <p>
            Inflexa products are designed to support learning, not replace
            formal education.
          </p>
          <p className="text-sm text-gray-600">
            Learning outcomes vary by individual, and we do not guarantee
            specific academic results.
          </p>
        </Section>

        {/* 12. Limitation of Liability */}
        <Section id="liability" title="12. Limitation of Liability">
          <p>To the maximum extent permitted by law:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>
              Inflexa is not liable for indirect, incidental, or consequential
              damages.
            </li>
            <li>
              Our total liability is limited to the amount paid for the product
              giving rise to the claim.
            </li>
          </ul>
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <svg
              className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <p className="text-sm text-blue-800">
              Nothing in these Terms limits liability where it would be unlawful
              to do so.
            </p>
          </div>
        </Section>

        {/* 13. Privacy & Data Protection */}
        <Section id="privacy" title="13. Privacy & Data Protection">
          <p>
            Your use of our website is also governed by our{' '}
            <Link
              to="/privacy"
              className="text-mood-toke-green font-medium hover:underline"
            >
              Privacy Policy
            </Link>
            , which explains how we collect and use personal data.
          </p>
        </Section>

        {/* 14. International Use */}
        <Section id="international" title="14. International Use">
          <p>
            Our website is accessible internationally, including in Nigeria, the
            United States, and select European countries.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-mood-toke-green/5 rounded-xl border border-mood-toke-green/20">
              <svg
                className="w-5 h-5 text-mood-toke-green shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-gray-700">
                Customers outside the UK may purchase and download{' '}
                <strong>printable products</strong>.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <svg
                className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-amber-700">
                Physical shipping is currently available within the{' '}
                <strong>United Kingdom only</strong>. International shipping is
                planned for a future date.
              </p>
            </div>
          </div>
        </Section>

        {/* 15. Changes to These Terms */}
        <Section id="changes" title="15. Changes to These Terms">
          <p>
            We may update these Terms from time to time. Changes will be posted
            on this page with an updated &ldquo;Last Updated&rdquo; date.
          </p>
          <p className="text-sm text-gray-600">
            Your continued use of our services constitutes acceptance of the
            revised Terms.
          </p>
        </Section>

        {/* 16. Governing Law & Jurisdiction */}
        <Section id="governing-law" title="16. Governing Law & Jurisdiction">
          <p>
            These Terms and any dispute or claim arising out of or in connection
            with them shall be governed by and construed in accordance with the
            laws of <strong>England and Wales</strong>.
          </p>
          <p className="text-sm text-gray-600">
            If you are a consumer residing outside the United Kingdom, you may
            also benefit from any mandatory provisions of the consumer
            protection laws of your country of residence. Nothing in these Terms
            affects your rights under such mandatory local laws.
          </p>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <svg
              className="w-5 h-5 text-gray-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
              />
            </svg>
            <p className="text-sm text-gray-600">
              Subject to the above, the courts of England and Wales shall have
              exclusive jurisdiction.
            </p>
          </div>
        </Section>

        {/* 17. Contact Information */}
        <Section id="contact" title="17. Contact Information">
          <p>If you have questions about these Terms, contact us at:</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href="mailto:support@inflexatechnologies.com"
              className="inline-flex items-center gap-2 text-mood-toke-green font-medium hover:underline text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              support@inflexatechnologies.com
            </a>
            <address className="not-italic text-sm text-gray-600">
              128 City Road, London, EC1V 2NX, United Kingdom
            </address>
          </div>
        </Section>

      </div>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Have a question about our Terms?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get in touch with our team or review our Privacy Policy for
            information on how we handle your data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-mood-toke-green text-white text-[15px] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
            >
              Contact Us
            </Link>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-[15px] font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}