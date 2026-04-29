import { Link } from 'react-router-dom';

export default function ForSchoolsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-teal-900 text-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-accent-500 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-6">Coming Soon</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Inflexa for Schools
          </h1>
          <p className="text-lg sm:text-xl text-brand-100 leading-relaxed max-w-2xl mx-auto">
            We're building tools to bring structured, offline-first learning into the classroom. Bulk ordering, teacher resources, and curriculum-aligned packs — all coming soon.
          </p>
        </div>
      </section>

      {/* What's Coming */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">What's Coming</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: 'Bulk Ordering', description: 'Order flashcard packs in bulk for your classroom or school at discounted rates.' },
              { title: 'Teacher Resources', description: 'Lesson plans, activity guides, and assessment tools to complement each pack.' },
              { title: 'Curriculum Aligned', description: 'Packs mapped to Key Stage 1–4 learning objectives for seamless integration.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interest Form CTA */}
      <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-100">
        <div className="text-center max-w-xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Interested?</h2>
          <p className="text-base text-gray-600 mb-8">
            Get in touch and we'll let you know as soon as our schools programme is ready.
          </p>
          <Link
            to="/contact"
            className="inline-block rounded-full px-10 py-4 text-white bg-mood-toke-green font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md hover:opacity-90"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
