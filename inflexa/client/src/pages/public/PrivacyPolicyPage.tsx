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
/*  Rights card                                                        */
/* ------------------------------------------------------------------ */

function RightsCard({
  jurisdiction,
  badge,
  badgeColor,
  rights,
  contact,
}: {
  jurisdiction: string;
  badge: string;
  badgeColor: string;
  rights: string[];
  contact?: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="text-base font-semibold text-gray-900">{jurisdiction}</h3>
        <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
        {rights.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      {contact && (
        <div className="pt-1 text-sm text-gray-600">{contact}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Retention table row                                                */
/* ------------------------------------------------------------------ */

function RetentionRow({ type, period }: { type: string; period: string }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-3.5 text-gray-700 font-medium">{type}</td>
      <td className="px-5 py-3.5 text-gray-600 text-right">{period}</td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Privacy Policy Page                                                */
/* ------------------------------------------------------------------ */

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-mood-pink/30">
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
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            How Inflexa Technologies Limited collects, uses, and protects your
            personal data.
          </p>
          <p className="mt-3 text-sm text-gray-400">Last Updated: 15/02/2026</p>

          {/* Quick nav */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { href: '#information', label: 'Data We Collect' },
              { href: '#rights', label: 'Your Rights' },
              { href: '#retention', label: 'Retention' },
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

      {/* ── Compliance badges ────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            'UK GDPR',
            'EU GDPR',
            'Data Protection Act 2018',
            'CCPA / CPRA',
          ].map((label) => (
            <span
              key={label}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-mood-toke-green/10 text-mood-toke-green border border-mood-toke-green/20"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Policy content ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">

        {/* 1. Introduction */}
        <Section id="introduction" title="1. Introduction">
          <p>
            <strong>Inflexa Technologies Limited</strong> (&ldquo;Inflexa&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) respects
            your privacy and is committed to protecting your personal data.
          </p>
          <p>This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Visit our website</li>
            <li>Purchase our products</li>
            <li>Contact us</li>
            <li>Use our services</li>
            <li>Subscribe to communications</li>
          </ul>
          <p>
            This policy applies globally and is designed to comply with UK GDPR,
            EU GDPR, the Data Protection Act 2018 (UK), the California Consumer
            Privacy Act (CCPA/CPRA), and other applicable international data
            protection laws.
          </p>
        </Section>

        {/* 2. Who We Are */}
        <Section id="who-we-are" title="2. Who We Are">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</p>
              <p className="text-sm font-medium text-gray-900">Inflexa Technologies Limited</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registered Office</p>
              <p className="text-sm text-gray-700">128 City Road, London, EC1V 2NX, United Kingdom</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
              <a
                href="mailto:inflexatechnologies@gmail.com"
                className="text-sm text-mood-toke-green font-medium hover:underline"
              >
                inflexatechnologies@gmail.com
              </a>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Website</p>
              <p className="text-sm text-gray-700">
                inflexatechnologies.co.uk &amp; inflexatechnologies.com
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            We are the <strong>data controller</strong> responsible for your
            personal data.
          </p>
        </Section>

        {/* 3. Information We Collect */}
        <Section id="information" title="3. Information We Collect">
          <p>We collect personal data necessary to provide our services.</p>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">A. Information You Provide</h3>
              <p className="text-sm text-gray-600 mb-3">
                When you place an order, create an account, subscribe to email
                updates, or contact us, we may collect:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Billing and delivery address</li>
                <li>Payment details (processed securely by third parties)</li>
                <li>Communications with us</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">B. Automatically Collected Information</h3>
              <p className="text-sm text-gray-600 mb-3">
                When you use our website, we may automatically collect:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>IP address</li>
                <li>Device type</li>
                <li>Browser type</li>
                <li>Pages visited</li>
                <li>Time spent</li>
                <li>Referring URLs</li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                This is collected via cookies and analytics technologies. See
                our{' '}
                <Link to="/cookies" className="text-mood-toke-green font-medium hover:underline">
                  Cookie Policy
                </Link>{' '}
                for full details.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">C. Children&rsquo;s Information</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                Our products are designed for children aged 3&ndash;8. However,
                accounts and purchases must be made by a parent, guardian, or
                authorised adult. We do not knowingly collect personal data
                directly from children without parental consent. If we discover
                such data, we will delete it promptly. Parents or guardians may{' '}
                <Link to="/contact" className="font-medium underline">
                  contact us
                </Link>{' '}
                to review or delete their child&rsquo;s information.
              </p>
            </div>
          </div>
        </Section>

        {/* 4. How We Use Your Data */}
        <Section id="how-we-use" title="4. How We Use Your Data">
          <p>We use personal data to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Process and deliver orders</li>
            <li>Provide customer support</li>
            <li>Send order confirmations</li>
            <li>Improve our products and services</li>
            <li>Send marketing communications (with consent)</li>
            <li>Prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
          <div className="flex items-center gap-3 p-4 bg-mood-toke-green/5 rounded-xl border border-mood-toke-green/20">
            <svg className="w-5 h-5 text-mood-toke-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-mood-toke-green">We do not sell personal data.</p>
          </div>
        </Section>

        {/* 5. Legal Bases */}
        <Section id="legal-bases" title="5. Legal Bases for Processing (GDPR Regions)">
          <p>
            If you are located in the UK or EU, we process your data under the
            following legal bases:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { base: 'Contractual necessity', purpose: 'Order fulfilment' },
              { base: 'Consent', purpose: 'Marketing communications' },
              { base: 'Legal obligation', purpose: 'Tax and accounting' },
              { base: 'Legitimate interest', purpose: 'Service improvement, fraud prevention' },
            ].map(({ base, purpose }) => (
              <div key={base} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-900">{base}</p>
                <p className="text-xs text-gray-500 mt-0.5">{purpose}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. Your Rights */}
        <Section id="rights" title="6. Your Data Protection Rights">
          <p>Depending on your location, you have the following rights:</p>
          <div className="space-y-4">
            <RightsCard
              jurisdiction="Under GDPR (UK / EU)"
              badge="UK & EU"
              badgeColor="bg-blue-50 text-blue-700"
              rights={[
                'Access your personal data',
                'Correct inaccurate data',
                'Request erasure',
                'Restrict processing',
                'Object to processing',
                'Data portability',
                'Withdraw consent',
              ]}
              contact={
                <p>
                  We will respond within <strong>30 days</strong>. To exercise
                  your rights, email{' '}
                  <a
                    href="mailto:inflexatechnologies@gmail.com"
                    className="text-mood-toke-green font-medium hover:underline"
                  >
                    inflexatechnologies@gmail.com
                  </a>
                  .
                </p>
              }
            />
            <RightsCard
              jurisdiction="Under CCPA / CPRA (California Residents)"
              badge="California"
              badgeColor="bg-amber-50 text-amber-700"
              rights={[
                'Know what personal data we collect',
                'Request deletion of your data',
                'Request correction',
                'Opt out of data selling (we do not sell data)',
                'Non-discrimination for exercising your rights',
              ]}
              contact={
                <p>
                  To exercise rights, contact:{' '}
                  <a
                    href="mailto:inflexatechnologies@gmail.com"
                    className="text-mood-toke-green font-medium hover:underline"
                  >
                    inflexatechnologies@gmail.com
                  </a>
                </p>
              }
            />
          </div>
        </Section>

        {/* 7. Sharing of Data */}
        <Section id="sharing" title="7. Sharing of Data">
          <p>
            We only share data with trusted third parties necessary to operate
            our business:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Payment processors (e.g. Stripe, Paystack)</li>
            <li>Delivery partners</li>
            <li>Hosting providers</li>
            <li>Analytics providers</li>
            <li>Email marketing platforms</li>
          </ul>
          <p className="text-sm text-gray-600">
            All partners are contractually required to protect your data.
          </p>
          <div className="flex items-center gap-3 p-4 bg-mood-toke-green/5 rounded-xl border border-mood-toke-green/20">
            <svg className="w-5 h-5 text-mood-toke-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-mood-toke-green">We do not sell personal information.</p>
          </div>
        </Section>

        {/* 8. International Transfers */}
        <Section id="transfers" title="8. International Transfers">
          <p>
            Your data may be processed outside your country of residence. Where
            required, we ensure appropriate safeguards are in place, such as:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Standard Contractual Clauses</li>
            <li>Adequacy decisions</li>
            <li>Secure processing agreements</li>
          </ul>
        </Section>

        {/* 9. Data Retention */}
        <Section id="retention" title="9. Data Retention">
          <p>We retain data only as long as necessary:</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-900">Data Type</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-900">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <RetentionRow type="Orders" period="6–7 years (legal requirement)" />
                <RetentionRow type="Accounts" period="Until deletion requested" />
                <RetentionRow type="Marketing" period="Until unsubscribe" />
                <RetentionRow type="Enquiries" period="Up to 2 years" />
              </tbody>
            </table>
          </div>
        </Section>

        {/* 10. Data Security */}
        <Section id="security" title="10. Data Security">
          <p>
            We implement appropriate technical and organisational measures to
            protect personal data, including:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z', label: 'SSL encryption' },
              { icon: 'M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z', label: 'Secure servers' },
              { icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z', label: 'Restricted access' },
              { icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z', label: 'Trusted payment providers' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <svg className="w-5 h-5 text-mood-toke-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <p className="text-sm font-medium text-gray-700">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            While we take reasonable steps to protect your data, no system is
            completely secure.
          </p>
        </Section>

        {/* 11. Cookies */}
        <Section id="cookies" title="11. Cookies & Tracking Technologies">
          <p>We use cookies to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Improve functionality</li>
            <li>Analyse traffic</li>
            <li>Store preferences</li>
          </ul>
          <p>
            You can manage cookies via your browser settings or our consent
            tool. For full details, see our{' '}
            <Link
              to="/cookies"
              className="text-mood-toke-green font-medium hover:underline"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </Section>

        {/* 12. Marketing */}
        <Section id="marketing" title="12. Marketing Communications">
          <p>We will only send marketing communications if:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>You have opted in, or</li>
            <li>Permitted under applicable law</li>
          </ul>
          <p>
            You may unsubscribe at any time via the link in any marketing email.
          </p>
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Third-Party Links</h3>
            <p className="text-sm text-gray-600">
              Our website may contain links to external websites. We are not
              responsible for their privacy practices.
            </p>
          </div>
        </Section>

        {/* 13. Safeguarding */}
        <Section id="safeguarding" title="13. Safeguarding & Children's Protection">
          <p>
            We prioritise child safety. Our products are designed for children
            aged 3&ndash;8, but all accounts and purchases must be made by a
            parent, guardian, or authorised adult.
          </p>
          <p>We:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Do not knowingly collect data directly from children</li>
            <li>Do not engage in behavioural advertising targeted at children</li>
            <li>Do not sell children&rsquo;s data</li>
            <li>Require adult consent for all purchases and account creation</li>
          </ul>
        </Section>

        {/* 14. Changes */}
        <Section id="changes" title="14. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. Any changes will be
            posted on this page with a revised &ldquo;Last Updated&rdquo; date.
          </p>
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-amber-700">
              If you believe a child&rsquo;s data has been improperly collected,
              please{' '}
              <Link to="/contact" className="font-medium underline">
                contact us
              </Link>{' '}
              immediately.
            </p>
          </div>
        </Section>

        {/* 15. Contact */}
        <Section id="contact" title="15. Contact Us">
          <p>For privacy-related questions:</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href="mailto:inflexatechnologies@gmail.com"
              className="inline-flex items-center gap-2 text-mood-toke-green font-medium hover:underline text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              inflexatechnologies@gmail.com
            </a>
            <address className="not-italic text-sm text-gray-600">
              128 City Road, London, EC1V 2NX, United Kingdom
            </address>
          </div>
        </Section>

        {/* 16. Regulatory Authorities */}
        <Section id="regulators" title="16. Regulatory Authorities">
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-900 mb-1">United Kingdom</p>
              <p className="text-sm text-gray-600">
                Information Commissioner&rsquo;s Office (ICO) &mdash;{' '}
                <a
                  href="https://www.ico.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mood-toke-green font-medium hover:underline"
                >
                  www.ico.org.uk
                </a>
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-900 mb-1">European Union</p>
              <p className="text-sm text-gray-600">
                Contact your local Data Protection Authority.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-900 mb-1">California</p>
              <p className="text-sm text-gray-600">
                California Attorney General&rsquo;s office.
              </p>
            </div>
          </div>
        </Section>

      </div>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Have a privacy question?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Our team is here to help. Get in touch or review our Cookie Policy
            for information on how we use tracking technologies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-mood-toke-green text-white text-[15px] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
            >
              Contact Us
            </Link>
            <Link
              to="/cookies"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-[15px] font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
