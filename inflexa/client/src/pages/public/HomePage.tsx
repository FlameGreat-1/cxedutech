import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/common/Button';
import FancyCards from '@/components/common/FancyCards';

// Hero images that will be served from public/hero/
const HERO_IMAGES = [
  { src: '/hero/hero-1.png', alt: 'Inflexa Flashcard Pack 1' },
  { src: '/hero/hero-2.png', alt: 'Inflexa Flashcard Pack 2' },
  { src: '/hero/hero-3.png', alt: 'Inflexa Flashcard Pack 3' },
  { src: '/hero/hero-4.png', alt: 'Inflexa Flashcard Pack 4' },
  { src: '/hero/hero-5.png', alt: 'Inflexa Flashcard Pack 5' },
  { src: '/hero/hero-6.png', alt: 'Inflexa Flashcard Pack 6' },
  { src: '/hero/hero-7.png', alt: 'Inflexa Flashcard Pack 7' },
];

export default function HomePage() {
  const { products, isLoading, error, refetch } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16 sm:pb-24">
          {/* Arc Carousel - the outer container provides the visible viewport.
              overflow-hidden clips the circle's lower portion so only the
              top arc of fanned-out cards is visible.
              The FancyCards wrapper is pinned to the bottom-center because
              offset-path: circle(radius at 50% 100%) places the circle
              center at the wrapper's bottom, fanning cards upward. */}
          <div
            className="relative overflow-hidden mx-auto"
            style={{
              height: 'clamp(340px, 50vmin, 480px)',
              maxWidth: '100%',
            }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <FancyCards
                images={HERO_IMAGES}
                cardWidth="clamp(110px, 18vmin, 190px)"
                radius="clamp(300px, 55vmin, 550px)"
                arcSize={0.42}
                arcCenter={0.75}
                arcShiftDelta={0.012}
                hoverAnchor="50% 10%"
              />
            </div>
          </div>

          {/* Text + CTA */}
          <div className="max-w-2xl mx-auto text-center mt-10 sm:mt-14">
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Offline-first gamified flashcard packs designed for children aged 3-8.
              Physical and printable formats that make education an adventure.
            </p>
            <div className="mt-8">
              <Link to="/store">
                <Button variant="secondary" size="lg">Browse Collection</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Inflexa?</h2>
          <p className="mt-2 text-gray-600">Designed with purpose, built for little learners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            title="Offline-First Learning"
            description="No screens, no Wi-Fi needed. Our flashcards work anywhere, anytime. Perfect for focused, distraction-free learning."
          />
          <FeatureCard
            icon="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            title="Age-Appropriate Content"
            description="Carefully curated for ages 3-8. Each pack targets specific developmental milestones with engaging, gamified content."
          />
          <FeatureCard
            icon="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
            title="Physical + Printable"
            description="Choose physical packs delivered to your door, or printable versions you can use instantly. Flexibility for every family."
          />
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Packs</h2>
              <p className="mt-1 text-gray-600">Our most popular flashcard collections</p>
            </div>
            <Link
              to="/store"
              className="hidden sm:inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>

          <ProductGrid products={featured} isLoading={isLoading} error={error} onRetry={refetch} />

          <div className="mt-8 text-center sm:hidden">
            <Link to="/store">
              <Button variant="secondary" size="md">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Age Range Bands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Age</h2>
          <p className="mt-2 text-gray-600">Find the perfect pack for your child's age group</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/store?min_age=3&max_age=5"
            className="group relative overflow-hidden rounded-2xl bg-brand-600 p-8 sm:p-10
              hover:bg-brand-700 transition-colors"
          >
            <div className="relative z-10">
              <span className="text-brand-200 text-sm font-medium">Ages</span>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mt-1">3-5 Years</h3>
              <p className="text-brand-100 mt-2 text-sm">Early learning fundamentals, colours, shapes, and first words</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-white">
                Browse packs
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>

          <Link
            to="/store?min_age=6&max_age=8"
            className="group relative overflow-hidden rounded-2xl bg-brand-800 p-8 sm:p-10
              hover:bg-brand-900 transition-colors"
          >
            <div className="relative z-10">
              <span className="text-brand-300 text-sm font-medium">Ages</span>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mt-1">6-8 Years</h3>
              <p className="text-brand-200 mt-2 text-sm">Maths, reading, science, and general knowledge challenges</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-white">
                Browse packs
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center p-6">
      <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
