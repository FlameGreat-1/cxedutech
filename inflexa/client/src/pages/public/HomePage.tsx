import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/common/Button';
import StackingCardsSection, { StackingCardData } from '@/components/common/StackingCards';


const FEATURE_CARDS: StackingCardData[] = [
  {
    label: 'Adaptive Learning',
    title: 'Learning That\nAdapts to Them',
    description:
      'Learning that adapts to the learner, rather than forcing the learner to adapt to rigid systems. Every child gets a path built for them.',
    src: '/learning.avif',
    alt: 'Adaptive learning experience tailored to each child',
    panelColor:      'var(--color-brand-900)',   /* Deep forest green — grounded primary */
    imagePanelColor: 'var(--color-brand-800)',   /* Slightly lighter green for depth     */
    textColor:       '#ffffff',                  /* White — always on dark panels        */
    accentColor:     'var(--color-lime-400)',    /* Lime — youth/attention highlight     */
    ctaText: 'Browse all packs',
    ctaLink: '/store',
    icon: '/icons/graduation-cap.svg',
  },
  {
    label: 'Offline First',
    title: 'No Wi-Fi. No\nScreens. No Limits.',
    description:
      'No screens, no Wi-Fi needed. Our flashcards work anywhere, anytime — perfect for focused, distraction-free learning that lets children engage deeply.',
    src: '/offline.avif',
    alt: 'Child learning with Inflexa flashcards outdoors without any screens',
    panelColor:      'var(--color-teal-950)',    /* Deepest teal — trust, reliability    */
    imagePanelColor: 'var(--color-teal-900)',    /* Slightly lighter teal for depth      */
    textColor:       '#ffffff',
    accentColor:     'var(--color-teal-300)',    /* Vivid cyan — intelligence/info       */
    ctaText: 'Shop physical packs',
    ctaLink: '/store?format=physical',
    icon: '/icons/book.svg',
  },
  {
    label: 'Age-Appropriate',
    title: 'Built for Every\nMilestone',
    description:
      'Carefully curated for ages 3–8. Each pack targets specific developmental milestones with engaging, gamified content that grows with your child.',
    src: '/age-content.avif',
    alt: 'Colourful age-appropriate flashcard packs arranged by developmental stage',
    panelColor:      'var(--color-blue-950)',    /* Deep cobalt — stability, structure   */
    imagePanelColor: 'var(--color-blue-900)',    /* Slightly lighter blue for depth      */
    textColor:       '#ffffff',
    accentColor:     'var(--color-accent-400)', /* Orange — creativity, CTA energy      */
    ctaText: 'Browse by age',
    ctaLink: '/store?min_age=3&max_age=8',
    icon: '/icons/People.png',
  },
  {
    label: 'Physical & Printable',
    title: 'Your Format.\nYour Pace.',
    description:
      'Choose physical packs delivered to your door, or printable versions you can use instantly. Flexibility for every family, every budget, every learning moment.',
    src: '/printable.avif',
    alt: 'Physical flashcard pack alongside a printable PDF version on a table',
    panelColor:      'var(--color-accent-950)',  /* Deep warm red — action, engagement   */
    imagePanelColor: 'var(--color-accent-900)',  /* Slightly lighter red for depth       */
    textColor:       '#ffffff',
    accentColor:     'var(--color-highlight-300)', /* Yellow — playfulness, attention    */
    ctaText: 'Explore formats',
    ctaLink: '/store?format=printable',
    icon: '/icons/Printer.png',
  },
];

export default function HomePage() {
  const { products, isLoading, error, refetch } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <div style={{ overflowX: 'clip' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        style={{
          background:
            'linear-gradient(135deg, var(--color-brand-100) 0%, var(--color-brand-50) 30%, #f9fafb 60%, var(--color-accent-50) 100%)',
        }}
        className="overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-24 pb-14 sm:pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.08]">
                Learning That{' '}
                <span className="text-brand-700">Grows With</span>{' '}
                Your Child.
              </h1>

              <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Offline-first, gamified flashcard packs for ages 3–8. Physical and printable formats that turn every subject into an adventure — no screens required.
              </p>

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  to="/store"
                  className="text-[15px] font-semibold text-highlight-700 border border-highlight-400 rounded-xl px-8 py-3.5 hover:bg-highlight-50 hover:border-highlight-500 transition-all duration-200"
                >
                  Browse Collections
                </Link>
                <Link
                  to="/store?format=printable"
                  className="text-[15px] font-semibold text-teal-700 border border-teal-300 rounded-full px-6 py-2.5 hover:bg-teal-50 hover:border-teal-400 transition-all duration-200"
                >
                  Try Printable Packs
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-br from-brand-200/30 via-teal-200/20 to-accent-200/20 blur-[100px] rounded-full -z-10" />
              <div
                className="relative overflow-hidden shadow-2xl bg-white"
                style={{ borderRadius: '30% 70% 55% 45% / 55% 30% 70% 45%' }}
              >
                <img
                  src="/learning.avif"
                  alt="Child interacting and learning"
                  className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Inflexa section header ────────────────────────────── */}
      <div className="pt-20 sm:pt-28 pb-6 px-4 bg-white">
        {/* Mobile: simple centered stack */}
        <div className="flex flex-col items-center text-center sm:hidden">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Inflexa
          </h2>
          <p className="mt-2 text-base font-medium text-gray-600 leading-relaxed max-w-xs">
            Designed with <span className="text-accent-600 font-semibold">purpose</span>, built for <span className="text-brand-600 font-semibold">little learners</span>
          </p>
        </div>

        {/* Desktop (sm+): precise D-under-a alignment */}
        <div className="hidden sm:flex justify-center">
          <div className="inline-flex flex-col">
            <h2 className="sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight text-left">
              Inflexa
            </h2>
            <div className="flex items-baseline mt-1">
              {/* Invisible spacer: "Inflex" (without "a") so "D" aligns on the same vertical as "a" */}
              <span
                className="sm:text-4xl lg:text-5xl font-extrabold tracking-tight invisible select-none"
                aria-hidden="true"
              >
                Inflex
              </span>
              <p className="sm:text-xl lg:text-2xl font-medium text-gray-600 leading-relaxed whitespace-nowrap">
                Designed with <span className="text-accent-600 font-semibold">purpose</span>, built for <span className="text-brand-600 font-semibold">little learners</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stacking Cards ────────────────────────────────────────── */}
      <StackingCardsSection cards={FEATURE_CARDS} />

      {/* ── Featured Packs ───────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
                style={{
                  backgroundColor: 'var(--color-highlight-50)',
                  color: 'var(--color-highlight-700)',
                }}
              >
                Popular
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Featured Packs</h2>
              <p className="mt-2 text-base sm:text-lg text-gray-500">Our most popular flashcard collections</p>
            </div>
            <Link
              to="/store"
              className="hidden sm:inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <ProductGrid products={featured} isLoading={isLoading} error={error} onRetry={refetch} />

          <div className="mt-10 text-center sm:hidden">
            <Link to="/store">
              <Button variant="secondary" size="md">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Shop by Age ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
            style={{
              backgroundColor: 'var(--color-accent-50)',
              color: 'var(--color-accent-700)',
            }}
          >
            Browse
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Shop by Age</h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500">Find the perfect pack for your child's age group</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/store?min_age=3&max_age=5"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 sm:p-10 hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative z-10">
              <span className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Ages</span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-1">3–5 Years</h3>
              <p className="text-brand-100 mt-3 text-[15px] leading-relaxed max-w-xs">Early learning fundamentals, colours, shapes, and first words</p>
              <span className="inline-flex items-center gap-2 mt-6 text-[15px] font-semibold text-white">
                Browse packs
                <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>

          <Link
            to="/store?min_age=6&max_age=8"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-8 sm:p-10 hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative z-10">
              <span className="text-brand-300 text-sm font-semibold tracking-wide uppercase">Ages</span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-1">6–8 Years</h3>
              <p className="text-brand-200 mt-3 text-[15px] leading-relaxed max-w-xs">Maths, reading, science, and general knowledge challenges</p>
              <span className="inline-flex items-center gap-2 mt-6 text-[15px] font-semibold text-white">
                Browse packs
                <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}