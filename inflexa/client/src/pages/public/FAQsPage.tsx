import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                           */
/* ------------------------------------------------------------------ */

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  name: string;
  icon: string; // SVG path (d attribute)
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    name: 'Orders & Delivery',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.25m0 0V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25',
    items: [
      {
        question: 'How long will it take for my order to arrive?',
        answer:
          'All orders are shipped via EasyPost with tracked delivery. Once dispatched, delivery typically takes 2\u20133 working days within the UK. You will receive a tracking number by email so you can follow your parcel every step of the way.',
      },
      {
        question: 'How much does shipping cost?',
        answer:
          'Shipping costs are calculated dynamically at checkout based on your delivery address, order weight, and available carrier options. You will see the exact shipping rates and estimated delivery times before you confirm your order, so there are no surprises.\n\nSimply enter your shipping address during checkout and choose from the available delivery options. Your selected shipping cost is clearly shown in the order summary before payment.\n\nInternational shipping is not currently available but is coming soon.',
      },
      {
        question: 'How do I track my order?',
        answer:
          'Once your order has been dispatched you will receive an email with your tracking number. You can also track your order by logging into your account and visiting the \u201cTrack Order\u201d page, or by using our guest order lookup if you checked out as a guest.',
      },
      {
        question: 'What is the current turnaround time?',
        answer:
          'Our current turnaround time is 3\u20137 working days. This is the time it takes to process and prepare your order before it is handed to our shipping carrier. Delivery time is additional and typically takes 2\u20133 working days after dispatch.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'We currently only ship within the United Kingdom. We are working on expanding to international markets and will announce availability through our social media channels and email newsletter.',
      },
    ],
  },
  {
    name: 'Products & Packs',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    items: [
      {
        question: 'What age range are the flashcards designed for?',
        answer:
          'Our flashcard packs are carefully curated for children aged 3\u20138. Each pack targets specific developmental milestones and is clearly labelled with the recommended age range so you can choose the perfect fit for your child.',
      },
      {
        question: 'What is the difference between physical and printable packs?',
        answer:
          'Physical packs are professionally printed, laminated flashcard sets delivered directly to your door. Printable packs are high-quality PDF files that you can download instantly and print at home as many times as you need. Both formats contain the same carefully designed content.',
      },
      {
        question: 'Do the flashcards require Wi-Fi or a screen?',
        answer:
          'No. Our flashcards are completely offline-first. Physical packs need no technology at all, and printable packs only require a one-time download and print. Once printed, they work anywhere, anytime with zero screen time.',
      },
      {
        question: 'Are the flashcards aligned with the UK curriculum?',
        answer:
          'Yes. All of our packs are designed by qualified teachers and aligned with the Early Years Foundation Stage (EYFS) and Key Stage 1 (KS1) frameworks. Each pack clearly states the subjects and learning objectives it covers.',
      },
    ],
  },
  {
    name: 'Returns & Refunds',
    icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          'If you change your mind about an order you can request a refund within 14 days of receiving your goods by emailing inflexatechnologies@gmail.com with your order number and the reason you wish to return the item. You will be responsible for all return postage costs.',
      },
      {
        question: 'How long does a refund take to process?',
        answer:
          'Once we have received and inspected the returned items, a refund will be issued within 10 business days. The money will be returned through your original payment method. Processing times may vary by payment provider.',
      },
      {
        question: 'Can I return personalised items?',
        answer:
          'We do not offer refunds or exchanges on personalised learning items unless they are faulty or incorrect on delivery. If this is the case, please email inflexatechnologies@gmail.com with a photograph of the fault and we will be happy to provide a replacement or a full refund.',
      },
      {
        question: 'What if my order arrives damaged?',
        answer:
          'We take great care in packaging every order, but if your items arrive damaged please contact us within 48 hours of delivery at inflexatechnologies@gmail.com with your order number and a photo of the damage. We will arrange a replacement or refund at no extra cost to you.',
      },
    ],
  },
  {
    name: 'Payments',
    icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe, as well as Apple Pay, Google Pay, and Paystack. All transactions are processed securely and we never store your card details.',
      },
      {
        question: 'Is it safe to pay on your website?',
        answer:
          'Absolutely. All payments are processed through Stripe and Paystack, both of which are PCI DSS Level 1 certified payment processors. Your connection is encrypted with HTTPS and we never have access to your full card details.',
      },
      {
        question: 'Can I checkout without creating an account?',
        answer:
          'Yes. We offer full guest checkout so you can complete your purchase without registering. You will still receive an order confirmation email and can track your order using our guest order lookup page.',
      },
    ],
  },
  {
    name: 'Account & General',
    icon: 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z',
    items: [
      {
        question: 'Do I need an account to place an order?',
        answer:
          'No, you can checkout as a guest. However, creating a free account gives you access to order history, faster checkout on future purchases, and the ability to track all your orders in one place.',
      },
      {
        question: 'How do I reset my password?',
        answer:
          'Click \u201cLogin\u201d in the top navigation, then select \u201cForgot Password\u201d. Enter the email address associated with your account and we will send you a secure link to reset your password.',
      },
      {
        question: 'How can I contact you?',
        answer:
          'You can reach us through our Contact Us page, or email us directly at inflexatechnologies@gmail.com. We aim to respond to all enquiries within 24 hours.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Accordion Item                                                     */
/* ------------------------------------------------------------------ */

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 px-1 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green focus-visible:ring-offset-2 rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] sm:text-base font-medium text-gray-900 group-hover:text-mood-toke-green transition-colors leading-snug pr-2">
          {item.question}
        </span>
        <span
          className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? 'bg-mood-toke-green text-white rotate-180'
              : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[600px] opacity-100 pb-5' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-1 text-sm sm:text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category Tab                                                       */
/* ------------------------------------------------------------------ */

function CategoryTab({
  name,
  icon,
  isActive,
  onClick,
  count,
}: {
  name: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green ${
        isActive
          ? 'bg-mood-toke-green text-white shadow-sm'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm'
      }`}
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {name}
      <span
        className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
          isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQs Page                                                          */
/* ------------------------------------------------------------------ */

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  /* Derive filtered data */
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return FAQ_DATA.map((category) => {
      const filtered = category.items.filter((item) => {
        const matchesSearch =
          !query ||
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query);
        const matchesCategory = !activeCategory || category.name === activeCategory;
        return matchesSearch && matchesCategory;
      });
      return { ...category, items: filtered };
    }).filter((category) => category.items.length > 0);
  }, [searchQuery, activeCategory]);

  const totalResults = filteredData.reduce((sum, cat) => sum + cat.items.length, 0);

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

  function clearFilters() {
    setSearchQuery('');
    setActiveCategory(null);
    setOpenItems(new Set());
  }

  return (
    <div className="bg-white min-h-screen">
      {/* \u2500\u2500 Hero Banner \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-mood-lavender/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-6">
            <img
              src="/icons/helpAndFaq.svg"
              alt=""
              className="w-8 h-8"
              style={{ filter: 'brightness(0) saturate(100%)' }}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about Inflexa flashcard packs, orders, shipping, and more.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-lg mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a question..."
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mood-toke-green focus:border-mood-toke-green shadow-sm transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 Category Tabs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green ${
                !activeCategory
                  ? 'bg-mood-toke-green text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              All
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  !activeCategory ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {FAQ_DATA.reduce((sum, cat) => sum + cat.items.length, 0)}
              </span>
            </button>
            {FAQ_DATA.map((category) => (
              <CategoryTab
                key={category.name}
                name={category.name}
                icon={category.icon}
                isActive={activeCategory === category.name}
                onClick={() =>
                  setActiveCategory((prev) =>
                    prev === category.name ? null : category.name
                  )
                }
                count={category.items.length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 FAQ Content \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Results count */}
        {(searchQuery || activeCategory) && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {totalResults} {totalResults === 1 ? 'result' : 'results'} found
              {searchQuery && (
                <span>
                  {' '}for <span className="font-medium text-gray-700">\"{searchQuery}\"</span>
                </span>
              )}
            </p>
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-mood-toke-green hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* No results */}
        {filteredData.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              We couldn't find any questions matching your search. Try different keywords or browse all categories.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mood-toke-green text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              View all FAQs
            </button>
          </div>
        )}

        {/* Categories with accordions */}
        <div className="space-y-10">
          {filteredData.map((category) => (
            <div key={category.name}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-mood-lavender/50">
                  <svg
                    className="w-5 h-5 text-mood-toke-green"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={category.icon} />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{category.name}</h2>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 px-5 sm:px-6 divide-y divide-gray-200">
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
      </section>

      {/* \u2500\u2500 Still Need Help CTA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Still have a question?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Can't find what you're looking for? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-mood-toke-green text-white text-[15px] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Contact Us
            </Link>
            <Link
              to="/shipping"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-[15px] font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              View Shipping Policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
