import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail, MapPin, Phone, Twitter, Instagram, ArrowLeft } from 'lucide-react'
import useAuthStore from '../context/authStore'

const CONTACT = {
  name: 'Visory',
  email: 'contact@visory.app',
  phone: '+92 300 0000000',
  addressLine: 'Lahore, Pakistan',
  mapQuery: 'Lahore Pakistan',
  socials: [
    { name: 'GitHub', href: 'https://github.com/', icon: Github },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/', icon: Linkedin },
    { name: 'X (Twitter)', href: 'https://twitter.com/', icon: Twitter },
    { name: 'Instagram', href: 'https://www.instagram.com/', icon: Instagram },
  ],
}

const ContactContent = ({ showBackToHome }) => (
  <div className="space-y-6 animate-fade-in">
    {showBackToHome && (
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#8888aa] hover:text-white">
        <ArrowLeft size={14} />
        Back to home
      </Link>
    )}

    <div>
      <h1 className="text-2xl font-bold text-white">Contact Us</h1>
      <p className="text-[#8888aa] text-sm mt-1">
        Questions, feedback, or want a demo? Reach out — we respond quickly.
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-4 items-start">
      <section className="card p-5 space-y-4">
        <div className="space-y-3">
          <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 text-sm text-[#e8e8f0] hover:text-primary-300">
            <span className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Mail size={16} className="text-primary-400" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-[#8888aa]">Email</span>
              <span className="block font-medium truncate">{CONTACT.email}</span>
            </span>
          </a>

          <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm text-[#e8e8f0] hover:text-primary-300">
            <span className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Phone size={16} className="text-primary-400" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-[#8888aa]">Phone</span>
              <span className="block font-medium truncate">{CONTACT.phone}</span>
            </span>
          </a>

          <div className="flex items-center gap-3 text-sm text-[#e8e8f0]">
            <span className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <MapPin size={16} className="text-primary-400" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-[#8888aa]">Location</span>
              <span className="block font-medium truncate">{CONTACT.addressLine}</span>
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.07]">
          <p className="text-sm font-semibold text-white mb-2">Social links</p>
          <div className="flex flex-wrap gap-2">
            {CONTACT.socials.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[#e8e8f0] hover:border-white/[0.14] hover:bg-white/[0.05] transition-all inline-flex items-center gap-2 text-sm"
              >
                <Icon size={16} className="text-[#b9b9d2]" />
                {name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="card p-2 overflow-hidden">
        <div className="px-3 pt-3 pb-2">
          <p className="text-sm font-semibold text-white">Google Location</p>
          <p className="text-xs text-[#8888aa] mt-0.5">Find us on the map.</p>
        </div>
        <div className="aspect-video bg-black/20">
          <iframe
            title="Visory Location"
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapQuery)}&output=embed`}
          />
        </div>
      </section>
    </div>
  </div>
)

export default function ContactPage() {
  const token = useAuthStore((s) => s.token)

  // When user is logged in, this page is rendered inside `AppLayout`.
  if (token) return <ContactContent showBackToHome={false} />

  // Standalone (public) view
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#e8e8f0]">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-sm text-[#8888aa] hover:text-white transition-colors">
            {CONTACT.name}
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#8888aa] hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm py-2">Get Started Free</Link>
          </div>
        </div>

        <ContactContent showBackToHome />
      </div>
    </div>
  )
}

