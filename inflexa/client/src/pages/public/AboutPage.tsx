import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-teal-900 text-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            About Inflexa
          </h1>
          <p className="text-lg sm:text-xl text-brand-100 leading-relaxed max-w-2xl mx-auto">
            We're on a mission to make structured, offline-first learning accessible to every child.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg text-gray-600 max-w-none">
            <p>
              Inflexa was founded with a simple belief: children learn best when they can touch, hold, and interact with their learning materials — without the distractions of screens and notifications.
            </p>
            <p>
              Our flashcard packs are designed by educators and parents who understand that real learning happens through structured repetition, progressive challenge, and tangible engagement. Each pack is carefully curated to align with developmental milestones across ages 6–16.
            </p>
            <p>
              We started with English and are expanding into Mathematics, Science, Engineering, and more. Our goal is to build a complete learning system — one that grows with your child from Foundation through to Pre-exam readiness.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: 'Offline First', description: 'No Wi-Fi, no screens, no distractions. Learning that works anywhere, anytime.' },
              { title: 'Structured Learning', description: 'Every pack follows a clear progression path, building understanding step by step.' },
              { title: 'British Made', description: 'Designed and produced in the UK, aligned with British curriculum standards.' },
            ].map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 border-t border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-base text-gray-600 mb-8">Explore our collections and find the right pack for your child.</p>
          <Link
            to="/store"
            className="inline-block rounded-full px-10 py-4 text-white bg-mood-toke-green font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md hover:opacity-90"
          >
            Browse Collections
          </Link>
        </div>
      </section>
    </div>
  );
}
