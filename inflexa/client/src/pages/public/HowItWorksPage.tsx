import { Link } from 'react-router-dom';

const AGE_STAGES = [
  { age: '6–8', level: 'Foundation', focus: 'Basics + confidence' },
  { age: '8–10', level: 'Developing', focus: 'Understanding + application' },
  { age: '10–12', level: 'Expanding', focus: 'Deeper learning' },
  { age: '12–14', level: 'Advanced', focus: 'Critical thinking' },
  { age: '14–16', level: 'Pre-exam', focus: 'Exam readiness' },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-teal-900 text-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            A Simple System That Scales with Your Child
          </h1>
          <p className="text-lg sm:text-xl text-brand-100 leading-relaxed max-w-2xl mx-auto">
            Structured flashcard packs. Progressive learning levels. Designed for real understanding.
          </p>
        </div>
      </section>

      {/* How To Use */}
      <section className="py-16 sm:py-24 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">How To Use</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Pick a card', description: 'Choose a flashcard from the pack and read the prompt or question on the front.' },
              { step: '2', title: 'Understand', description: 'Flip to the back and study the answer, explanation, or visual cue provided.' },
              { step: '3', title: 'Practice', description: 'Repeat regularly to build confidence and reinforce learning through spaced repetition.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mood-toke-green/10 flex items-center justify-center text-mood-toke-green text-2xl font-extrabold">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Works */}
      <section className="py-16 sm:py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Why It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Builds vocabulary and understanding',
              'Reinforces learning through repetition',
              'Supports independent thinking',
              'Works across subjects',
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-mood-toke-green flex items-center justify-center text-white font-bold text-lg mb-4">
                  {i + 1}
                </div>
                <p className="text-base font-semibold text-gray-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age Roadmap */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">Age Roadmap</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our progression system is designed to grow with your child through five structured stages.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {AGE_STAGES.map((stage, i) => (
              <Link
                key={stage.age}
                to={`/store?age_range=${stage.age.replace('–', '-')}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 text-center hover:shadow-lg hover:border-mood-toke-green transition-all group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-mood-toke-green/10 flex items-center justify-center text-mood-toke-green text-xl font-extrabold group-hover:bg-mood-toke-green group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{stage.level}</h3>
                <p className="text-sm font-semibold text-mood-toke-green mb-1">{stage.age}</p>
                <p className="text-xs text-gray-500">{stage.focus}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">More Subjects. More Levels. One System.</h2>
          <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto">
            We are building a growing library of learning packs across English, Maths, Science, Engineering, basic literacy and more.
          </p>
          <Link
            to="/store"
            className="inline-block rounded-full px-10 py-4 text-white bg-mood-toke-green font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md hover:opacity-90"
          >
            Start your child's learning journey today
          </Link>
        </div>
      </section>
    </div>
  );
}
