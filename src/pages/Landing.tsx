import { Link } from 'react-router-dom'
import { OrdoLogo } from '../components/OrdoLogo'
import {
  Shield, FileText, Mail, Calendar, Search, AlertTriangle,
  ArrowRight, CheckCircle, ChevronDown, Copy, Check
} from 'lucide-react'
import { useState } from 'react'

export default function Landing() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const faqItems = [
    {
      q: 'Comment intégrer mes dossiers existants ?',
      a: 'Ordo supporte l\'importation de dossiers via PDF ou email. L\'IA extrait automatiquement les délais et organise vos documents.'
    },
    {
      q: 'Puis-je personnaliser l\'interface ?',
      a: 'Oui, chaque cabinet peut adapter l\'ordre des sections, les rappels et les paramètres d\'urgence selon ses besoins.'
    },
    {
      q: 'Mes données restent confidentielles ?',
      a: 'Absolument. Vos données ne sont jamais utilisées pour entraîner un modèle. Hébergement au Canada, conforme CPC.'
    },
    {
      q: 'Combien de temps pour maîtriser ?',
      a: 'Moins de 10 minutes. L\'interface est volontairement simple pour éviter la surcharge informationnelle.'
    },
    {
      q: 'Fonctionne avec nos systèmes actuels ?',
      a: 'Ordo s\'intègre avec Outlook et fonctionne en parallèle de vos outils existants, sans migration forcée.'
    },
  ]

  const testimonials = [
    {
      name: 'Maître Sophie D.',
      cabinet: 'Cabinet Droit Civil, Montréal',
      text: 'Avant : 50 rappels Outlook par jour. Maintenant : une vue claire le matin. Enfin un outil qui s\'adapte à moi.'
    },
    {
      name: 'Maître Jean L.',
      cabinet: 'Cabinet Familial, Québec',
      text: 'On gérait tout à la main. Ordo a centralisé nos délais en une semaine. Zéro stress, zéro erreur.'
    },
    {
      name: 'Maître Marie T.',
      cabinet: 'Cabinet Commercial, Toronto',
      text: 'Notre cabinet est sans papier depuis 2 ans. Ordo simplifie tout du jour au lendemain. Exactement ce qu\'il nous manquait.'
    },
  ]

  const copyEmail = () => {
    navigator.clipboard.writeText('demo@ordo.ca')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid #E2E8F0', backdropFilter: 'blur(8px)' }}
      >
        <OrdoLogo />
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-[13px] px-3 py-2 text-[#475569] hover:text-[#0F172A] transition-colors">
            Connexion
          </Link>
          <Link
            to="/register"
            className="text-[13px] px-4 py-2 rounded-lg font-medium transition-all"
            style={{ background: '#3B82F6', color: '#FFFFFF' }}
          >
            Accès bêta gratuit
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-[12px] font-medium"
          style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
          Bêta gratuite
        </div>

        <h1
          className="text-[52px] font-bold leading-[1.1] mb-6"
          style={{ color: '#0F172A', letterSpacing: '-0.03em' }}
        >
          Ne ratez plus jamais<br />un délai juridique.
        </h1>

        <p className="text-[18px] leading-relaxed mb-4 max-w-2xl mx-auto" style={{ color: '#475569' }}>
          Ordo extrait automatiquement les délais de vos dossiers et vous montre chaque jour ce qui est vraiment urgent.
        </p>

        <p className="text-[16px] font-medium mb-10" style={{ color: '#0F172A' }}>
          Conçu pour les avocats québécois.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
            style={{ background: '#3B82F6', color: '#FFFFFF' }}
          >
            Commencer gratuitement <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg font-medium transition-all"
            style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}
          >
            Se connecter
          </Link>
        </div>

        <p className="text-[12px] mt-5" style={{ color: '#94A3B8' }}>
          Aucune carte de crédit · Données hébergées au Canada
        </p>
      </section>

      {/* APP PREVIEW */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-bold mb-4" style={{ color: '#0F172A' }}>
            Une vue claire. Immédiatement.
          </h2>
          <p style={{ color: '#475569' }}>
            Vos dossiers, vos délais et vos urgences. En un seul endroit.
          </p>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
        >
          {/* Browser frame */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FECACA', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FDE68A', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#BBF7D0', display: 'inline-block' }} />
            <div
              className="flex-1 mx-4 rounded text-center text-[11px]"
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '3px 12px', color: '#94A3B8' }}
            >
              ordo.ca/tableau-de-bord
            </div>
          </div>

          {/* Preview image placeholder */}
          <div className="flex" style={{ height: 420, background: '#F8FAFC' }}>
            <div className="w-48 shrink-0 flex flex-col" style={{ background: '#FFFFFF', borderRight: '1px solid #E2E8F0' }}>
              <div className="p-4" style={{ borderBottom: '1px solid #E2E8F0' }}>
                <OrdoLogo size="sm" />
              </div>
              <div className="p-3 space-y-0.5">
                {['Tableau de bord', "Aujourd'hui", 'Calendrier', 'Statistiques'].map((item, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded text-[12px] transition-colors"
                    style={{
                      background: i === 0 ? '#EFF6FF' : 'transparent',
                      color: i === 0 ? '#3B82F6' : '#94A3B8'
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[14px] font-medium mb-2" style={{ color: '#475569' }}>
                  📊 Aperçu du dashboard
                </div>
                <div style={{ color: '#94A3B8', fontSize: '12px' }}>
                  Urgences · Délais · Dossiers<br />organisés en un coup d'œil
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM → SOLUTION */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-[28px] font-bold mb-8" style={{ color: '#0F172A' }}>
              Le problème aujourd'hui
            </h2>
            <div className="space-y-6">
              {[
                'Les délais sont dispersés dans vos emails et documents',
                'Vous devez vérifier manuellement ce qui est urgent',
                'Le risque d\'erreur est constant'
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div style={{ color: '#DC2626', fontSize: '20px' }}>✕</div>
                  <p style={{ color: '#475569' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[28px] font-bold mb-8" style={{ color: '#0F172A' }}>
              Ordo change ça
            </h2>
            <div className="space-y-6">
              {[
                'Extraction automatique des délais à partir de vos documents',
                'Vue « Aujourd\'hui » avec priorités claires',
                'Rappels quotidiens intelligents'
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div style={{ color: '#16A34A', fontSize: '20px' }}>✓</div>
                  <p style={{ color: '#475569' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES (SIMPLIFIED) */}
      <section className="max-w-5xl mx-auto px-6 py-20" style={{ background: '#F8FAFC' }}>
        <h2 className="text-[32px] font-bold text-center mb-12" style={{ color: '#0F172A' }}>
          L'essentiel, parfaitement exécuté
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Tout voir en un coup d\'œil',
              items: ['Vue Aujourd\'hui', 'Urgences visibles', 'Statuts clairs'],
              icon: '👁️'
            },
            {
              title: 'Automatisation intelligente',
              items: ['Extraction IA des délais', 'Centralisation des dossiers', 'Moins de saisie manuelle'],
              icon: '⚡'
            },
            {
              title: 'Rester en contrôle',
              items: ['Validation par l\'avocat', 'Rappels quotidiens', 'Organisation fiable'],
              icon: '🛡️'
            }
          ].map((block, i) => (
            <div key={i} className="p-6 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div className="text-[24px] mb-3">{block.icon}</div>
              <h3 className="text-[16px] font-semibold mb-4" style={{ color: '#0F172A' }}>
                {block.title}
              </h3>
              <ul className="space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-[14px]" style={{ color: '#475569' }}>
                    <CheckCircle size={16} style={{ color: '#16A34A', marginTop: '2px', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* DIFFERENTIATION */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-bold mb-4" style={{ color: '#0F172A' }}>
            Pensé pour le Québec
          </h2>
          <p style={{ color: '#475569' }}>
            À la différence des outils génériques, Ordo comprend votre pratique juridique québécoise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            'Interface en français juridique',
            'Adapté aux réalités des cabinets québécois',
            'Conforme au Code de procédure civile'
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-xl text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <p style={{ color: '#16A34A', fontWeight: 600 }}>{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* METRICS */}
      <section className="max-w-5xl mx-auto px-6 py-20" style={{ background: '#F8FAFC' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '10 min', label: 'Mise en place' },
            { value: '< 10s', label: 'Comprendre un dossier' },
            { value: '0', label: 'Compétence IT requise' },
            { value: '100%', label: 'Français juridique' }
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <p className="text-[28px] font-bold" style={{ color: '#3B82F6' }}>{stat.value}</p>
              <p className="text-[12px] mt-2" style={{ color: '#94A3B8' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-[32px] font-bold text-center mb-12" style={{ color: '#0F172A' }}>
          Ce que disent les avocats
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="p-6 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <p className="text-[14px] mb-6 italic" style={{ color: '#475569' }}>
                "{testimonial.text}"
              </p>
              <div>
                <p style={{ color: '#0F172A', fontWeight: 600, fontSize: '14px' }}>{testimonial.name}</p>
                <p style={{ color: '#94A3B8', fontSize: '12px' }}>{testimonial.cabinet}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20" style={{ background: '#F8FAFC' }}>
        <h2 className="text-[32px] font-bold text-center mb-4" style={{ color: '#0F172A' }}>
          Questions fréquentes
        </h2>
        <p className="text-center mb-12" style={{ color: '#475569' }}>
          Nous sommes là pour vous aider. Avez-vous d'autres questions ?{' '}
          <button onClick={copyEmail} className="text-[#3B82F6] hover:underline inline-flex items-center gap-1">
            Contactez-nous <span>{copiedEmail ? <Check size={14} /> : <Copy size={14} />}</span>
          </button>
        </p>

        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-medium transition-colors"
                style={{ color: '#0F172A' }}
              >
                {item.q}
                <ChevronDown
                  size={20}
                  style={{
                    color: '#94A3B8',
                    transform: expandedFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>
              {expandedFaq === i && (
                <div className="px-6 pb-4" style={{ color: '#475569', borderTop: '1px solid #E2E8F0' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-[32px] font-bold mb-4" style={{ color: '#0F172A' }}>
          Reprenez le contrôle de vos délais.
        </h2>
        <p className="mb-8" style={{ color: '#475569' }}>
          Commencez gratuitement. Aucun engagement.
        </p>

        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-medium transition-all"
          style={{ background: '#3B82F6', color: '#FFFFFF', fontSize: '16px' }}
        >
          Accès bêta gratuit <ArrowRight size={18} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="mt-20" style={{ background: '#0F172A', color: '#FFFFFF', borderTop: '1px solid #1E293B' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-4 text-[14px]">Produit</h3>
              <ul className="space-y-2 text-[13px]" style={{ color: '#94A3B8' }}>
                <li><Link to="#" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Tarification</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-[14px]">Entreprise</h3>
              <ul className="space-y-2 text-[13px]" style={{ color: '#94A3B8' }}>
                <li><Link to="#" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Équipe</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Carrières</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-[14px]">Support</h3>
              <ul className="space-y-2 text-[13px]" style={{ color: '#94A3B8' }}>
                <li><Link to="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-[14px]">Légal</h3>
              <ul className="space-y-2 text-[13px]" style={{ color: '#94A3B8' }}>
                <li><Link to="#" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Conditions</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">RGPD</Link></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', textAlign: 'center' }}>
            <p style={{ color: '#94A3B8', fontSize: '13px' }}>
              © {new Date().getFullYear()} Ordo. Tous droits réservés. · Données hébergées au Canada
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
