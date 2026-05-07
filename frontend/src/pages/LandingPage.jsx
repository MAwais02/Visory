import { Link } from 'react-router-dom'
import { Zap, BookOpen, Brain, Target, BarChart2, Bell, ArrowRight, CheckCircle2 } from 'lucide-react'

const features = [
  { icon: Brain, title: 'AI Course Generation', desc: 'Describe what you want to learn. Get a full structured curriculum in seconds.' },
  { icon: BookOpen, title: 'Resource Curation', desc: 'YouTube, Coursera, GitHub, and more — all handpicked for each topic.' },
  { icon: Target, title: 'Smart Scheduling', desc: 'Realistic timelines built around your weekly availability and goals.' },
  { icon: BarChart2, title: 'Progress Analytics', desc: 'Track streaks, time spent, quiz scores, and completion dashboards.' },
  { icon: Brain, title: 'Adaptive Learning', desc: 'AI adjusts difficulty and resources based on your quiz performance.' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Stay on track with email and in-app notifications for study sessions.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#e8e8f0]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">Visory</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-[#8888aa] hover:text-white transition-colors">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm py-2">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-4 pt-20 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-medium mb-6">
            <Zap size={12} /> Powered by GPT-4 · Built for learners
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight max-w-3xl mx-auto">
            Your personal AI<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              learning architect
            </span>
          </h1>
          <p className="text-[#8888aa] text-lg max-w-xl mx-auto mt-6">
            Tell us what you want to learn. Get a full personalized curriculum, curated resources, timelines, quizzes, and adaptive coaching — instantly.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
              Start Learning Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-ghost text-base px-6 py-3">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-center text-2xl font-bold text-white mb-10">Everything you need to learn faster</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 hover:border-primary-500/30 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center mb-3 group-hover:bg-primary-500/20 transition-all">
                <Icon size={18} className="text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-[#8888aa]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-20 px-4">
        <div className="inline-block card p-8 max-w-lg">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to build your curriculum?</h2>
          <p className="text-[#8888aa] text-sm mb-6">Free to start. No credit card required.</p>
          <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-base py-3">
            <Zap size={18} /> Create Free Account
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.07] py-6 text-center text-xs text-[#8888aa]">
        © {new Date().getFullYear()} Visory · FYP Project
      </footer>
    </div>
  )
}
