import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/common/Button';
import StackingCardsSection, { StackingCardData } from '@/components/common/StackingCards';

const FEATURE_CARDS: StackingCardData[] = [
  {
    title: 'Learning That Adapts',
    description:
      'Learning that adapts to the learner, rather than forcing the learner to adapt to rigid systems.',
    src: '/learning.avif',
    alt: 'Adaptive learning experience tailored to each child',
    color: '#6b7280',
    textColor: '#ffffff',
    accentColor: 'rgba(255,255,255,0.18)',
    icon: 'M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5',
  },
  {
    title: 'Offline-First Learning',
    description:
      'No screens, no Wi-Fi needed. Our flashcards work anywhere, anytime. Perfect for focused, distraction-free learning that lets children engage deeply without digital distractions.',
    src: '/offline.avif',
    alt: 'Child learning with Inflexa flashcards outdoors without any screens',
    color: '#166534',
    textColor: '#ffffff',
    accentColor: 'rgba(255,255,255,0.15)',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  {
    title: 'Age-Appropriate Content',
    description:
      'Carefully curated for ages 3-8. Each pack targets specific developmental milestones with engaging, gamified content that grows with your child through every learning stage.',
    src: '/age-content.avif',
    alt: 'Colourful age-appropriate flashcard packs arranged by developmental stage',
    color: '#0f4c75',
    textColor: '#ffffff',
    accentColor: 'rgba(255,255,255,0.15)',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    title: 'Physical + Printable',
    description:
      'Choose physical packs delivered to your door, or printable versions you can use instantly. Flexibility for every family, every budget, every learning moment.',
    src: '/printable.avif',
    alt: 'Physical flashcard pack alongside a printable PDF version on a table',
    color: '#c2410c',
    textColor: '#ffffff',
    accentColor: 'rgba(255,255,255,0.15)',
    icon: 'M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z',
  },
];

export default function HomePage() {
  const { products, isLoading, error, refetch } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <div style={{ overflowX: 'clip' }}>
      <section style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 30%, #f9fafb 60%, #fff7ed 100%)' }} className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-24 pb-14 sm:pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.08]">
                Learning That{' '}
                <span className="text-brand-600">Grows With</span>{' '}
                Your Child.
              </h1>

              <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Offline-first, gamified flashcard packs for ages 3–8. Physical and printable formats that turn every subject into an adventure — no screens required.
              </p>

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link to="/store">
                  <Button variant="cta" size="lg">
                    Browse Collections
                  </Button>
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

      <div className="text-center pt-20 sm:pt-24 pb-4 px-4 bg-white">
        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: '#f0fdfa', color: '#0f766e' }}>Features</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Inflexa?</h2>
        <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-md mx-auto">Designed with purpose, built for little learners</p>
      </div>

      <StackingCardsSection cards={FEATURE_CARDS} />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3" style={{ backgroundColor: '#fefce8', color: '#a16207' }}>Popular</span>
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}>Browse</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Shop by Age</h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500">Find the perfect pack for your child's age group</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/store?min_age=3&max_age=5"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 sm:p-10
              hover:shadow-xl transition-all duration-300"
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
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-8 sm:p-10
              hover:shadow-xl transition-all duration-300"
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
