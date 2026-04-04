import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useToast } from '@/hooks/useToast';
import apiClient, { extractErrorMessage } from '@/api/client';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const INITIAL_FORM: ContactFormData = {
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: '',
};

const SUBJECT_OPTIONS = [
  'General Enquiry',
  'Order Issue',
  'Shipping Question',
  'Return or Refund',
  'Product Question',
  'Bulk or Wholesale Order',
  'Partnership or Collaboration',
  'Other',
];

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

function validateForm(data: ContactFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required.';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.';
  }

  if (!data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.subject) {
    errors.subject = 'Please select a subject.';
  }

  if (!data.message.trim()) {
    errors.message = 'Message is required.';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/*  Info Card                                                          */
/* ------------------------------------------------------------------ */

function InfoCard({
  icon,
  title,
  children,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200">
      <div
        className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact Page                                                       */
/* ------------------------------------------------------------------ */

export default function ContactPage() {
  const { addToast } = useToast();
  const [form, setForm] = useState<ContactFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function updateField(field: keyof ContactFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await apiClient.post('/contact', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });

      setIsSubmitted(true);
      setForm(INITIAL_FORM);
      addToast('success', response.data?.data?.message || 'Your message has been sent successfully. We will get back to you shortly.');
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="bg-mood-pink/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-6">
            <img
              src="/icons/contact.png"
              alt=""
              className="w-8 h-8"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Contact Us
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">

          {/* ── Left: Info Cards ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <InfoCard
              icon={
                <svg className="w-5 h-5 text-mood-toke-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
              title="Email Us"
              accent="rgba(21, 76, 33, 0.08)"
            >
              <a
                href="mailto:inflexatechnologies@gmail.com"
                className="text-mood-toke-green font-medium hover:underline"
              >
                inflexatechnologies@gmail.com
              </a>
            </InfoCard>

            <InfoCard
              icon={
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Response Time"
              accent="rgba(14, 165, 233, 0.08)"
            >
              <p>We aim to respond to all enquiries within <strong>24 hours</strong>.</p>
            </InfoCard>

            <InfoCard
              icon={
                <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              }
              title="Quick Answers"
              accent="rgba(249, 115, 22, 0.08)"
            >
              <p>
                Check our{' '}
                <Link to="/faqs" className="text-mood-toke-green font-medium hover:underline">
                  FAQs
                </Link>{' '}
                for instant answers to common questions.
              </p>
            </InfoCard>

            <InfoCard
              icon={
                <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              }
              title="Follow Us"
              accent="rgba(240, 192, 208, 0.3)"
            >
              <div className="flex items-center gap-3 mt-1">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="transition-opacity hover:opacity-70"
                >
                  <img src="/icons/Facebook.png" alt="Facebook" className="w-6 h-6 object-contain brightness-0" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="transition-opacity hover:opacity-70"
                >
                  <img src="/icons/Instagram.png" alt="Instagram" className="w-6 h-6 object-contain brightness-0" />
                </a>
              </div>
            </InfoCard>
          </div>

          {/* ── Right: Contact Form ───────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              {isSubmitted ? (
                /* Success state */
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 mb-5">
                    <svg className="w-8 h-8 text-mood-toke-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                  <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    Thank you for reaching out. We've received your message and will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-mood-toke-green text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* Form */
                <>
                  <div className="mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Send Us a Message</h2>
                    <p className="text-sm text-gray-500 mt-1">Fill in the form below and we'll get back to you as soon as possible.</p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        placeholder="Flame"
                        value={form.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        error={errors.firstName}
                        required
                        autoComplete="given-name"
                      />
                      <Input
                        label="Last Name"
                        placeholder="Great"
                        value={form.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        error={errors.lastName}
                        required
                        autoComplete="family-name"
                      />
                    </div>

                    {/* Email */}
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="flame@example.com"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      error={errors.email}
                      required
                      autoComplete="email"
                    />

                    {/* Subject */}
                    <div className="w-full">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <select
                        id="subject"
                        value={form.subject}
                        onChange={(e) => updateField('subject', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 transition-colors duration-150 appearance-none bg-white ${
                          errors.subject
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-mood-toke-green focus:border-mood-toke-green hover:border-mood-toke-green'
                        }`}
                        aria-invalid={!!errors.subject}
                        required
                      >
                        <option value="" disabled>
                          Select a subject
                        </option>
                        {SUBJECT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="w-full">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us how we can help..."
                        value={form.message}
                        onChange={(e) => updateField('message', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-150 resize-y min-h-[120px] ${
                          errors.message
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-mood-toke-green focus:border-mood-toke-green hover:border-mood-toke-green'
                        }`}
                        aria-invalid={!!errors.message}
                        required
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-400 text-right">
                        {form.message.length} / 2000
                      </p>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                          </svg>
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Looking for quick answers?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Many common questions are already answered in our FAQs and Shipping Policy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/faqs"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-mood-toke-green text-white text-[15px] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
            >
              View FAQs
            </Link>
            <Link
              to="/shipping"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-[15px] font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Shipping Policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
