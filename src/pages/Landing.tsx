import { Link } from 'react-router-dom'
import { OrdoLogo } from '../components/OrdoLogo'
import {
  Shield, FileText, Mail, Calendar, Search,
  ArrowRight, CheckCircle, AlertTriangle
} from 'lucide-react'

const comparison = [
  { feature: 'Extraction automatique', a: true, b: true, ordo: true },
  { feature: 'Règles CPC Québec', a: false, b: false, ordo: true },
  { feature: 'En français natif', a: false, b: false, ordo: true },
  { feature: 'Prix abordable', a: false, b: false, ordo: true },
  { feature: 'Simple à maîtriser', a: false, b: false, ordo: true },
  { feature: 'Rappel courriel quotidien', a: false, b: true, ordo: true },
]

const features = [
  {
    icon: AlertTriangle,
    title: "Vue Aujourd'hui",
    desc: "Comprenez en 10 secondes ce qui est urgent, ce qui arrive, ce qui peut attendre.",
    color: '#DC2626',
  },
  {
    icon: FileText,
    title: 'Extraction IA',
    desc: "Déposez un PDF. L'IA extrait automatiquement la date clé, le type de document et un résumé.",
    color: '#3B82F6',
  },
  {
    icon: Calendar,
    title: 'Délais CPC Québec',
    desc: 'Suggestions de délais basées sur le Code de procédure civile. Vous validez avant que quoi que ce soit soit sauvegardé.',
    color: '#8B5CF6',
  },
  {
    icon: Mail,
    title: 'Courriel quotidien',
    desc: 'Chaque matin, un courriel scannable en 10 secondes. Urgences, délais à venir, rien de plus.',
    color: '#16A34A',
  },
  {
    icon: Search,
    title: 'Recherche instantanée',
    desc: "Retrouvez n'importe quel dossier par nom de client ou de dossier en quelques secondes.",
    color: '#D97706',
  },
  {
    icon: Shield,
    title: 'Confidentialité totale',
    desc: "Vos données ne sont jamais utilisées pour entraîner un modèle. Vos dossiers clients restent vos dossiers clients.",
    color: '#0F172A',
  },
]

const stats = [
  { value: '10 min', label: 'pour être opérationnel' },
  { value: '< 10s', label: 'pour comprendre un dossier' },
  { value: '0', label: 'compétence IT requise' },
  { value: '100%', label: 'en français juridique québécois' },
]

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>

      {/* Nav */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid #E2E8F0', backdropFilter: 'blur(8px)' }}
      >
        <OrdoLogo />
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-[13px]">
            Connexion
          </Link>
          <Link to="/register" className="btn-primary text-[13px]">
            Accès bêta gratuit
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-[12px] font-medium"
          style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
          Version bêta — accès gratuit limité
        </div>

        <h1
          className="text-[52px] font-bold leading-[1.1] mb-6"
          style={{ color: '#0F172A', letterSpacing: '-0.03em' }}
        >
          Ne ratez plus jamais
          <br />
          un délai juridique
        </h1>

        <p className="text-[18px] leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: '#475569' }}>
          Ordo organise vos dossiers, extrait les délais par IA et vous rappelle
          ce qui est urgent chaque matin, en 10 secondes.
          <br />
          <strong style={{ color: '#0F172A' }}>Conçu pour les avocats québécois.</strong>
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary gap-2" style={{ height: 48, paddingInline: 24, fontSize: 14 }}>
            Commencer gratuitement <ArrowRight size={14} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ height: 48, paddingInline: 24, fontSize: 14 }}>
            Se connecter
          </Link>
        </div>

        <p className="text-[12px] mt-5" style={{ color: '#94A3B8' }}>
          Aucune carte de crédit requise · Données hébergées au Canada
        </p>
      </section>

      {/* App preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
        >
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

          <div className="flex" style={{ height: 420, background: '#F8FAFC' }}>
            <div className="w-48 shrink-0 flex flex-col" style={{ background: '#FFFFFF', borderRight: '1px solid #E2E8F0' }}>
              <div className="p-4" style={{ borderBottom: '1px solid #E2E8F0' }}>
                <OrdoLogo size="sm" />
              </div>
              <div className="p-3 space-y-0.5">
                {['Tableau de bord', "Aujourd'hui", 'Nouveau dossier'].map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 px-3 py-2 rounded text-[11px]"
                    style={{ background: i === 0 ? '#F1F5F9' : 'transparent', color: i === 0 ? '#0F172A' : '#94A3B8' }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'currentColor', opacity: 0.5 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: '#0F172A' }}>Dossiers</p>
                  <p className="text-[11px]" style={{ color: '#94A3B8' }}>12 dossiers actifs</p>
                </div>
                <div className="px-3 py-1.5 rounded text-[11px] font-medium text-white" style={{ background: '#1E293B' }}>
                  + Nouveau dossier
                </div>
              </div>

              {[
                { name: 'Litige locatif Beaumont', client: 'Marie Beaumont', statut: 'urgent', delai: "Aujourd'hui" },
                { name: 'Recouvrement Gestion ABC', client: 'Gestion ABC Inc.', statut: 'surveiller', delai: 'Dans 3 jours' },
                { name: 'Contrat commercial Lapointe', client: 'Henri Lapointe', statut: 'actif', delai: '14 mai 2026' },
                { name: 'Succession Famille Côté', client: 'Pierre Côté', statut: 'actif', delai: '2 juin 2026' },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between px-4 py-3 rounded-lg mb-2"
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                >
                  <div>
                    <p className="text-[11px] font-medium" style={{ color: '#0F172A' }}>{row.name}</p>
                    <p className="text-[10px]" style={{ color: '#94A3B8' }}>{row.client}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: row.statut === 'urgent' ? '#FEF2F2' : row.statut === 'surveiller' ? '#FFFBEB' : '#F0FDF4',
                        color: row.statut === 'urgent' ? '#DC2626' : row.statut === 'surveiller' ? '#D97706' : '#16A34A',
                      }}
                    >
                      {row.statut === 'urgent' ? 'Urgent' : row.statut === 'surveiller' ? 'Surveiller' : 'Actif'}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: row.delai === "Aujourd'hui" ? '#DC2626' : '#475569' }}>
                      {row.delai}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#0F172A' }} className="py-16">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-[36px] font-bold mb-1" style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}>
                {value}
              </p>
              <p className="text-[13px]" style={{ color: '#64748B' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problème / Solution */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="rounded-xl p-8 mb-8" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-4" style={{ color: '#DC2626' }}>
            Le problème
          </p>
          <p className="text-[20px] font-semibold leading-snug mb-3" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
            Pour un avocat, rater un délai n'est pas un oubli.
            <br />C'est une faute professionnelle.
          </p>
          <p className="text-[14px] leading-relaxed" style={{ color: '#475569' }}>
            Radiation possible. Poursuite en responsabilité. Assurance professionnelle qui paie.
            Les outils disponibles sur le marché sont complexes, coûteux et conçus pour d'autres juridictions.
            Les avocats québécois n'ont pas de département IT.
          </p>
        </div>

        <div className="rounded-xl p-8" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-4" style={{ color: '#16A34A' }}>
            La solution
          </p>
          <p className="text-[20px] font-semibold leading-snug mb-3" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
            Ordo. Opérationnel en 10 minutes.
            <br />Clair en 10 secondes.
          </p>
          <ul className="space-y-2">
            {[
              "Déposez un PDF et l'IA extrait la date et résume le document",
              "La vue Aujourd'hui montre ce qui est urgent en un coup d'œil",
              'Les règles CPC Québec suggèrent vos délais automatiquement',
              'Chaque matin un courriel de rappel scannable en 10 secondes',
            ].map(item => (
              <li key={item} className="flex items-start gap-2.5 text-[13px]" style={{ color: '#15803D' }}>
                <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section style={{ background: '#F8FAFC' }} className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
            Fonctionnalités
          </p>
          <h2 className="text-center text-[32px] font-bold mb-12" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
            Tout ce dont vous avez besoin.
            <br />Rien de plus.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: `${color}14` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="text-[14px] font-semibold mb-2" style={{ color: '#0F172A' }}>{title}</p>
                <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparaison */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-center text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
          Pourquoi Ordo
        </p>
        <h2 className="text-center text-[32px] font-bold mb-10" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
          Fait pour le Québec.
        </h2>

        <div className="card overflow-hidden">
          <div className="grid grid-cols-4 px-5 py-3" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <p className="text-[12px] font-semibold" style={{ color: '#475569' }}>Fonctionnalité</p>
            {['Solution A', 'Solution B', 'Ordo'].map(name => (
              <p
                key={name}
                className="text-[12px] font-semibold text-center"
                style={{ color: name === 'Ordo' ? '#0F172A' : '#94A3B8' }}
              >
                {name}
              </p>
            ))}
          </div>
          {comparison.map(({ feature, a, b, ordo }, i) => (
            <div
              key={feature}
              className="grid grid-cols-4 px-5 py-3.5"
              style={{
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                borderBottom: i < comparison.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}
            >
              <p className="text-[13px]" style={{ color: '#475569' }}>{feature}</p>
              {[a, b, ordo].map((val, j) => (
                <div key={j} className="flex justify-center">
                  {val
                    ? <CheckCircle size={14} style={{ color: j === 2 ? '#16A34A' : '#CBD5E1' }} />
                    : <span style={{ color: '#CBD5E1', fontSize: 14 }}>·</span>
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0F172A' }} className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-4" style={{ color: '#475569' }}>
            Accès bêta gratuit
          </p>
          <h2 className="text-[36px] font-bold mb-4" style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}>
            Commencez aujourd'hui.
          </h2>
          <p className="text-[15px] mb-8" style={{ color: '#64748B' }}>
            Places limitées. Aucune carte de crédit. Opérationnel en 10 minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded font-medium text-[14px] transition-colors"
            style={{ background: '#FFFFFF', color: '#0F172A' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
          >
            Demander l'accès bêta <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 flex items-center justify-between" style={{ borderTop: '1px solid #E2E8F0' }}>
        <OrdoLogo size="sm" />
        <p className="text-[12px]" style={{ color: '#94A3B8' }}>
          © 2026 Ordo · Conçu pour les avocats québécois
        </p>
        <div className="flex items-center gap-5">
          <Link to="/login" className="text-[12px] transition-colors" style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0F172A' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}>
            Connexion
          </Link>
          <Link to="/register" className="text-[12px] transition-colors" style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0F172A' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}>
            Accès bêta
          </Link>
        </div>
      </footer>
    </div>
  )
}
