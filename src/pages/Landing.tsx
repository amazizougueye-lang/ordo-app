import { Link } from 'react-router-dom'
import { OrdoLogo } from '../components/OrdoLogo'
import { BackgroundPaths } from '../components/landing/BackgroundPaths'
import { WavePath } from '../components/landing/WavePath'
import { HowItWorks } from '../components/landing/HowItWorks'
import { FeaturesGrid } from '../components/landing/FeaturesGrid'
import { MetricsSection } from '../components/landing/MetricsSection'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion'
import { motion } from 'framer-motion'
import {
  ArrowRight, CheckCircle, X
} from 'lucide-react'
import { useEffect, useState } from 'react'

/* ─── Animated wrapper ─── */
function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Data ─── */

const problems = [
  'Les délais sont dispersés dans vos emails et documents',
  'Vous devez vérifier manuellement ce qui est urgent',
  'Le risque d\'erreur est constant',
]

const solutions = [
  'Extraction automatique des délais à partir de vos documents',
  'Vue "Aujourd\'hui" avec priorités claires',
  'Rappels quotidiens intelligents',
]

const faqItems = [
  { q: 'Comment intégrer mes dossiers existants ?', a: 'Ordo supporte l\'importation de dossiers via PDF ou email. L\'IA extrait automatiquement les délais et organise vos documents.' },
  { q: 'Puis-je personnaliser l\'interface ?', a: 'Oui, chaque cabinet peut adapter l\'ordre des sections, les rappels et les paramètres d\'urgence selon ses besoins.' },
  { q: 'Mes données restent confidentielles ?', a: 'Absolument. Vos données ne sont jamais utilisées pour entraîner un modèle. Hébergement au Canada, conforme à la Loi 25.' },
  { q: 'Combien de temps pour maîtriser l\'outil ?', a: 'Moins de 10 minutes. L\'interface est volontairement simple pour éviter la surcharge informationnelle.' },
  { q: 'Fonctionne avec nos systèmes actuels ?', a: 'Ordo s\'intègre avec Outlook et fonctionne en parallèle de vos outils existants, sans migration forcée.' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Oui. Chiffrement de bout en bout, hébergement au Canada, et aucune donnée partagée avec des tiers.' },
]

/* ─── Component ─── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#FAFBFC' }}>

      {/* ━━━ HEADER ━━━ */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10 py-4 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(250,251,252,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        }}
      >
        <OrdoLogo />
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-[13px] px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
            style={{ color: '#4a5568' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1a1a2e'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#4a5568'; e.currentTarget.style.background = 'transparent' }}
          >
            Connexion
          </Link>
          <Link
            to="/register"
            className="text-[13px] px-5 py-2.5 rounded-lg font-medium transition-all duration-200"
            style={{ background: '#1a1a2e', color: '#FFFFFF' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2d2d44' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1a1a2e' }}
          >
            Accès bêta gratuit
          </Link>
        </div>
      </header>

      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden">
        <BackgroundPaths />
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
          <Reveal>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-10 text-[12px] font-medium tracking-wide"
              style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
              Bêta gratuite
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1
              className="text-[40px] md:text-[56px] lg:text-[64px] font-bold leading-[1.08] mb-7"
              style={{ color: '#1a1a2e', letterSpacing: '-0.025em' }}
            >
              Votre calendrier
              <br />
              juridique
              <br />
              <span style={{ color: '#4a5568' }}>parfait commence ici.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="text-[16px] md:text-[17px] leading-[1.7] mb-4 max-w-xl mx-auto" style={{ color: '#5a6577' }}>
              Ordo extrait automatiquement les délais de vos dossiers et vous montre
              chaque jour ce qui est vraiment urgent.
            </p>
            <p className="text-[14px] font-medium mb-10" style={{ color: '#1a1a2e' }}>
              Conçu pour les avocats québécois.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200"
                style={{
                  background: '#2563eb',
                  color: '#FFFFFF',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1d4ed8'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#2563eb'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Commencer gratuitement
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl text-[14px] font-medium transition-all duration-200"
                style={{ color: '#4a5568', border: '1px solid #e2e8f0', background: '#FFFFFF' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#1a1a2e' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#4a5568' }}
              >
                Se connecter
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <p className="text-[12px] mt-7 tracking-wide" style={{ color: '#9ca3af' }}>
              Aucune carte de crédit requise · Données hébergées au Canada
            </p>
          </Reveal>
        </div>
      </section>

      {/* ━━━ APP PREVIEW ━━━ */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-[26px] md:text-[32px] font-semibold mb-3" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
              Une vue claire. Immédiatement.
            </h2>
            <p className="text-[15px]" style={{ color: '#5a6577' }}>
              Vos dossiers, vos délais et vos urgences. En un seul endroit.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <motion.div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
              background: '#FFFFFF',
            }}
            whileHover={{ y: -3, boxShadow: '0 24px 70px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* macOS bar */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ background: '#f8f9fa', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fecaca' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fde68a' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#bbf7d0' }} />
              <div
                className="flex-1 mx-4 rounded text-center text-[11px] font-medium"
                style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', padding: '4px 12px', color: '#9ca3af' }}
              >
                ordo.ca/tableau-de-bord
              </div>
            </div>

            {/* Dashboard mock */}
            <div className="flex" style={{ height: 400, background: '#f8f9fa' }}>
              <div className="w-52 shrink-0 flex-col hidden md:flex" style={{ background: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="p-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <OrdoLogo size="sm" />
                </div>
                <div className="p-3 space-y-1">
                  {['Tableau de bord', "Aujourd'hui", 'Nouveau dossier'].map((item, i) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-medium"
                      style={{ 
                        background: i === 0 ? '#f1f5f9' : 'transparent', 
                        color: i === 0 ? '#1a1a2e' : '#9ca3af',
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: 2, background: 'currentColor', opacity: 0.6 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: '#1a1a2e' }}>Dossiers</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>12 dossiers actifs</p>
                  </div>
                  <div className="px-4 py-2 rounded-lg text-[11px] font-medium text-white" style={{ background: '#1a1a2e' }}>
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
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl mb-2"
                    style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
                  >
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: '#1a1a2e' }}>{row.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{row.client}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: row.statut === 'urgent' ? '#fef2f2' : row.statut === 'surveiller' ? '#fffbeb' : '#f0fdf4',
                          color: row.statut === 'urgent' ? '#dc2626' : row.statut === 'surveiller' ? '#d97706' : '#16a34a',
                        }}
                      >
                        {row.statut === 'urgent' ? 'Urgent' : row.statut === 'surveiller' ? 'Surveiller' : 'Actif'}
                      </span>
                      <span className="text-[10px] font-medium" style={{ color: row.delai === "Aujourd'hui" ? '#dc2626' : '#5a6577' }}>
                        {row.delai}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </Reveal>
      </section>

      <HowItWorks />

      {/* ━━━ FEATURES GRID (6 items) ━━━ */}
      <FeaturesGrid />

      {/* ━━━ METRICS ━━━ */}
      <MetricsSection />

      <WavePath />

      {/* ━━━ PROBLEM → SOLUTION ━━━ */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <Reveal>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#9ca3af' }}>
            Le constat
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5 mt-10">
          <Reveal delay={0.08}>
            <div
              className="rounded-2xl p-8 h-full"
              style={{ background: '#fef7f7', border: '1px solid #fecaca' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-6" style={{ color: '#dc2626' }}>
                Le problème
              </p>
              <ul className="space-y-4">
                {problems.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
                    className="flex items-start gap-3 text-[14px] leading-relaxed"
                    style={{ color: '#1a1a2e' }}
                  >
                    <X size={15} className="shrink-0 mt-0.5" style={{ color: '#dc2626' }} strokeWidth={2.5} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div
              className="rounded-2xl p-8 h-full"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-6" style={{ color: '#16a34a' }}>
                La solution
              </p>
              <ul className="space-y-4">
                {solutions.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
                    className="flex items-start gap-3 text-[14px] leading-relaxed"
                    style={{ color: '#1a1a2e' }}
                  >
                    <CheckCircle size={15} className="shrink-0 mt-0.5" style={{ color: '#16a34a' }} strokeWidth={2.5} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ━━━ DIFFERENTIATION ━━━ */}
      <section className="py-24" style={{ background: '#f8f9fa' }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#9ca3af' }}>
              Pourquoi Ordo
            </p>
            <h2 className="text-center text-[26px] md:text-[32px] font-semibold mb-4" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
              Pensé pour le Québec.
            </h2>
            <p className="text-center text-[15px] max-w-lg mx-auto mb-14" style={{ color: '#5a6577' }}>
              Contrairement aux outils génériques, Ordo comprend votre pratique.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Français juridique', desc: 'Interface entièrement en français, avec le vocabulaire du droit québécois.' },
              { title: 'Réalités locales', desc: 'Adapté aux cabinets québécois : délais spécifiques, pratiques courantes, vocabulaire juridique local.' },
              { title: 'Simple par design', desc: 'Pas de département IT requis. Opérationnel en 10 minutes, maîtrisé en une heure.' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={0.08 + i * 0.08}>
                <div
                  className="rounded-2xl p-7 text-center h-full"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <p className="text-[14px] font-semibold mb-2.5" style={{ color: '#1a1a2e' }}>{item.title}</p>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#5a6577' }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section id="faq" className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid gap-14 md:grid-cols-[1fr_1.6fr]">
            <Reveal>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#9ca3af' }}>
                  FAQ
                </p>
                <h2 className="text-[26px] md:text-[32px] font-semibold mb-4" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
                  Questions<br />fréquentes
                </h2>
                <p className="text-[14px] leading-relaxed" style={{ color: '#5a6577' }}>
                  Tout ce que vous devez savoir pour commencer avec Ordo.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <Accordion type="single" collapsible>
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ━━━ FINAL CTA ━━━ */}
      <section style={{ background: '#1a1a2e' }} className="py-28 relative overflow-hidden">
        {/* Subtle glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: '#6b7280' }}>
              Accès bêta gratuit
            </p>
            <h2 className="text-[30px] md:text-[40px] font-semibold mb-5 leading-tight" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Reprenez le contrôle<br />de vos délais.
            </h2>
            <p className="text-[15px] mb-10" style={{ color: '#6b7280' }}>
              Commencez gratuitement. Aucun engagement.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-[14px] transition-all duration-200"
              style={{
                background: '#FFFFFF',
                color: '#1a1a2e',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Accès bêta gratuit
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer style={{ background: '#1a1a2e', color: '#FFFFFF', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 mb-14">

            {/* Brand block */}
            <div>
              <OrdoLogo />
              <p className="text-[13px] leading-relaxed mt-5 max-w-xs" style={{ color: '#6b7280' }}>
                Ordo aide les avocats québécois à ne jamais rater un délai juridique. Extraction automatique, vue claire, rappels intelligents.
              </p>
              <a
                href="mailto:flowmatic.ca@gmail.com"
                className="inline-flex items-center gap-2 mt-5 text-[13px] transition-colors"
                style={{ color: '#6b7280' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280' }}
              >
                flowmatic.ca@gmail.com
              </a>
            </div>

            {/* Produit */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: '#4b5563' }}>
                Produit
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-[13px] transition-colors text-left"
                    style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280' }}
                  >
                    Fonctionnalités
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-[13px] transition-colors text-left"
                    style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280' }}
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:flowmatic.ca@gmail.com"
                    className="text-[13px] transition-colors"
                    style={{ color: '#6b7280' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280' }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: '#4b5563' }}>
                Légal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/confidentialite"
                    className="text-[13px] transition-colors"
                    style={{ color: '#6b7280' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280' }}
                  >
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    to="/conditions"
                    className="text-[13px] transition-colors"
                    style={{ color: '#6b7280' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280' }}
                  >
                    Conditions d&apos;utilisation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rgpd"
                    className="text-[13px] transition-colors"
                    style={{ color: '#6b7280' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280' }}
                  >
                    RGPD
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[12px]" style={{ color: '#4b5563' }}>
              © {new Date().getFullYear()} Ordo. Tous droits réservés.
            </p>
            <p className="text-[12px]" style={{ color: '#4b5563' }}>
              Données hébergées au Canada · Conçu pour les avocats québécois
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
