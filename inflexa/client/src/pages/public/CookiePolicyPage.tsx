import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/hooks/useCookieConsent';

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
/*  Category badge                                                     */
/* ------------------------------------------------------------------ */

function CategoryCard({
  name,
  badge,
  badgeColor,
  description,
  examples,
  requiresConsent,
}: {
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  examples?: string[];
  requiresConsent: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
        <span
          className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${badgeColor}`}
        >
          {badge}
        </span>
        {requiresConsent ? (
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Consent required
          </span>
        ) : (
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-mood-toke-green/10 text-mood-toke-green">
            No consent needed
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      {examples && examples.length > 0 && (
        <ul className="text-sm text-gray-500 space-y-1 pl-4">
          {examples.map((ex) => (
            <li key={ex} className="list-disc">
              {ex}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cookie Policy Page                                                 */
/* ------------------------------------------------------------------ */

export default function CookiePolicyPage() {
  const { openModal, status, preferences } = useCookieConsent();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-mood-lavender/40">
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
                d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 9.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Cookie Policy
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            How Inflexa Technologies Limited uses cookies and similar
            technologies on our website.
          </p>
          <p className="mt-3 text-sm text-gray-400">Last Updated: 16/02/2026</p>
        </div>
      </section>

      {/* Your current consent status */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-200">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Your current cookie preferences
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-mood-toke-green/10 text-mood-toke-green font-medium">
                Necessary: Always On
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-medium ${
                  preferences.analytics
                    ? 'bg-mood-toke-green/10 text-mood-toke-green'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                Analytics: {preferences.analytics ? 'On' : 'Off'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-medium ${
                  preferences.functional
                    ? 'bg-mood-toke-green/10 text-mood-toke-green'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                Functional: {preferences.functional ? 'On' : 'Off'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-medium ${
                  preferences.marketing
                    ? 'bg-mood-toke-green/10 text-mood-toke-green'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                Marketing: {preferences.marketing ? 'On' : 'Off'}
              </span>
            </div>
            {status === 'pending' && (
              <p className="mt-2 text-xs text-amber-600 font-medium">
                You have not yet made a cookie selection.
              </p>
            )}
          </div>
          <button
            onClick={openModal}
            className="shrink-0 px-5 py-2.5 text-sm font-semibold text-white bg-mood-toke-green rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green focus-visible:ring-offset-2"
          >
            Manage Preferences
          </button>
        </div>
      </section>

      {/* Policy content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">

        <Section id="introduction" title="1. Introduction">
          <p>
            This Cookie Policy explains how{' '}
            <strong>Inflexa Technologies Limited</strong> (&ldquo;Inflexa&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) uses cookies
            and similar technologies on our website.
          </p>
          <p>
            By using our website, you agree to our use of cookies in accordance
            with this policy, unless you have disabled them via your browser or
            consent settings.
          </p>
        </Section>

        <Section id="what-are-cookies" title="2. What Are Cookies?">
          <p>
            Cookies are small text files placed on your device when you visit a
            website. They help websites to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Function properly</li>
            <li>Remember your preferences</li>
            <li>Improve user experience</li>
            <li>Analyse performance</li>
          </ul>
          <p>
            Cookies may be <strong>session cookies</strong> (deleted when you
            close your browser) or <strong>persistent cookies</strong> (stored
            for a set period).
          </p>
        </Section>

        <Section id="types" title="3. Types of Cookies We Use">
          <p>We use the following categories of cookies:</p>
          <div className="space-y-4 mt-2">
            <CategoryCard
              name="Strictly Necessary"
              badge="Always Active"
              badgeColor="bg-mood-toke-green/10 text-mood-toke-green"
              requiresConsent={false}
              description="These cookies are essential for the website to function correctly. They enable secure login, shopping cart functionality, the checkout process, and page navigation. Without these cookies, our website cannot operate properly."
            />
            <CategoryCard
              name="Performance & Analytics"
              badge="Optional"
              badgeColor="bg-blue-50 text-blue-700"
              requiresConsent={true}
              description="These cookies help us understand how visitors use our website by collecting anonymised information such as pages visited, time spent on pages, error messages, and traffic sources. This data is used to improve our services."
              examples={['Google Analytics', 'Similar analytics tools']}
            />
            <CategoryCard
              name="Functional"
              badge="Optional"
              badgeColor="bg-purple-50 text-purple-700"
              requiresConsent={true}
              description="These cookies remember your preferences such as language settings, region, and display preferences to improve your browsing experience."
            />
            <CategoryCard
              name="Marketing & Advertising"
              badge="Future Use"
              badgeColor="bg-amber-50 text-amber-700"
              requiresConsent={true}
              description="We currently use no advertising cookies. If introduced in future, these cookies may be used to deliver relevant advertisements, measure ad performance, and limit repeated ads. This policy will be updated and your consent will be requested before any such cookies are placed."
            />
          </div>
        </Section>

        <Section id="third-party" title="4. Third-Party Cookies">
          <p>
            Some cookies are placed by third-party services we use, such as:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Analytics providers</li>
            <li>Payment providers (e.g. Stripe, Paystack)</li>
            <li>Embedded content platforms</li>
          </ul>
          <p>
            We do not control these cookies. Please review the relevant
            third-party privacy policies for more information.
          </p>
        </Section>

        <Section id="managing" title="5. Managing Cookies">
          <p>You can manage or disable cookies in several ways:</p>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                A. Cookie Consent Tool
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Use the button below to open our cookie preferences panel at any
                time. You can accept, reject, or customise your choices.
              </p>
              <button
                onClick={openModal}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-mood-toke-green rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green"
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
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                  />
                </svg>
                Manage Cookie Preferences
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                B. Browser Settings
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                You can also control cookies through your browser settings.
                Please note that disabling cookies may affect website
                functionality.
              </p>
              <ul className="mt-2 text-sm text-gray-500 space-y-1 pl-4">
                <li className="list-disc">Chrome</li>
                <li className="list-disc">Safari</li>
                <li className="list-disc">Firefox</li>
                <li className="list-disc">Edge</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section id="your-rights" title="6. Your Rights">
          <p>Depending on your location, you may have rights to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Withdraw consent at any time</li>
            <li>Request information about cookies used</li>
            <li>Object to certain tracking</li>
          </ul>
          <p>
            For more information, see our{' '}
            <Link
              to="/privacy"
              className="text-mood-toke-green font-medium hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section
          id="compliance"
          title="7. International Data Protection Compliance"
        >
          <p>
            Our use of cookies complies with applicable data protection laws,
            including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>UK GDPR</li>
            <li>EU GDPR</li>
            <li>ePrivacy Directive</li>
            <li>CCPA/CPRA (where applicable)</li>
          </ul>
          <p>We implement consent mechanisms where required by law.</p>
        </Section>

        <Section id="governing-law" title="8. Governing Law & Jurisdiction">
          <p>
            This Cookie Policy shall be governed by and construed in accordance
            with the laws of England and Wales.
          </p>
          <p>
            If you are a consumer residing outside the United Kingdom, you may
            also benefit from any mandatory provisions of the consumer
            protection laws of your country of residence. Nothing in this policy
            affects your rights under such mandatory local laws.
          </p>
          <p>
            Subject to the above, the courts of England and Wales shall have
            exclusive jurisdiction.
          </p>
        </Section>

        <Section id="changes" title="9. Changes to This Policy">
          <p>
            We may update this Cookie Policy periodically. Any changes will be
            posted on this page with an updated &ldquo;Last Updated&rdquo; date.
            Where changes are material, we will re-request your consent.
          </p>
        </Section>

        <Section id="contact" title="10. Contact Us">
          <p>For cookie-related enquiries:</p>
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

      {/* Bottom CTA */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Have more questions?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Check our Privacy Policy or get in touch with our team directly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-mood-toke-green text-white text-[15px] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
            >
              Privacy Policy
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
