import { Link } from 'react-router-dom'
import { OrdoLogo } from '../components/OrdoLogo'
import { BackgroundPaths } from '../components/landing/BackgroundPaths'
import { WavePath } from '../components/landing/WavePath'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion'
import { motion } from 'framer-motion'
import {
  Shield, FileText, Mail, Search,
  ArrowRight, CheckCircle, AlertTriangle, X, Eye, Zap, Lock
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
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Data ─── */
const features = [
  {
    icon: Eye,
    title: 'Tout voir en un coup d\'oeil',
    desc: 'Vue Aujourd\'hui avec urgences visibles et statuts clairs. Comprenez en 10 secondes ce qui est urgent, ce qui arrive, ce qui peut attendre.',
    color: '#DC2626',
  },
  {
    icon: Zap,
    title: 'Automatisation intelligente',
    desc: 'Extraction IA des délais, centralisation des dossiers, moins de saisie manuelle. Déposez un PDF et laissez Ordo faire le reste.',
    color: '#3B82F6',
  },
  {
    icon: Lock,
    title: 'Rester en contrôle',
    desc: 'Validation par l\'avocat avant toute action. Rappels quotidiens et organisation fiable. Vos dossiers, vos règles.',
    color: '#16A34A',
  },
]

const detailedFeatures = [
  { icon: AlertTriangle, title: "Vue Aujourd'hui", desc: "Comprenez en 10 secondes ce qui est urgent.", color: '#DC2626' },
  { icon: FileText, title: 'Extraction IA', desc: "Déposez un PDF, l'IA extrait les dates clés.", color: '#3B82F6' },
  { icon: Mail, title: 'Courriel quotidien', desc: 'Chaque matin, un résumé scannable en 10 secondes.', color: '#16A34A' },
  { icon: Search, title: 'Recherche instantanée', desc: "Retrouvez n'importe quel dossier en secondes.", color: '#D97706' },
  { icon: Shield, title: 'Confidentialité totale', desc: "Vos données ne servent jamais à entraîner un modèle. Conforme à la Loi 25.", color: '#0F172A' },
]

const stats = [
  { value: '10 min', label: 'pour être opérationnel' },
  { value: '< 10s', label: 'pour comprendre un dossier' },
  { value: '0', label: 'compétence IT requise' },
  { value: '100%', label: 'en français juridique québécois' },
]

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
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>

      {/* ━━━ HEADER ━━━ */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid #E2E8F0' : '1px solid transparent',
          boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        <OrdoLogo />
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-[13px] px-4 py-2 rounded-lg transition-colors duration-200"
            style={{ color: '#475569' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.background = '#F1F5F9' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent' }}
          >
            Connexion
          </Link>
          <Link
            to="/register"
            className="text-[13px] px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
            style={{ background: '#0F172A', color: '#FFFFFF' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0F172A'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Accès bêta gratuit
          </Link>
        </div>
      </header>

      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden">
        <BackgroundPaths />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <Reveal>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-[12px] font-medium"
              style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
              Bêta gratuite
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1
              className="text-[40px] md:text-[52px] font-bold leading-[1.1] mb-6"
              style={{ color: '#0F172A', letterSpacing: '-0.03em' }}
            >
              Ne ratez plus jamais
              <br />
              un délai juridique.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-[17px] md:text-[18px] leading-relaxed mb-4 max-w-2xl mx-auto" style={{ color: '#475569' }}>
              Ordo extrait automatiquement les délais de vos dossiers et vous montre
              chaque jour ce qui est vraiment urgent.
            </p>
            <p className="text-[15px] font-medium mb-10" style={{ color: '#0F172A' }}>
              Conçu pour les avocats québécois.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl text-[14px] font-semibold transition-all duration-300"
                style={{
                  background: '#3B82F6',
                  color: '#FFFFFF',
                  boxShadow: '0 0 0 1px rgba(59,130,246,0.5), 0 2px 8px rgba(59,130,246,0.25)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.8), 0 4px 16px rgba(59,130,246,0.35)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.5), 0 2px 8px rgba(59,130,246,0.25)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Commencer gratuitement
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl text-[14px] font-medium transition-all duration-200"
                style={{ color: '#475569', border: '1px solid #E2E8F0' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#0F172A' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
              >
                Se connecter
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="text-[12px] mt-6" style={{ color: '#94A3B8' }}>
              Aucune carte de crédit requise · Données hébergées au Canada
            </p>
          </Reveal>
        </div>
      </section>

      {/* ━━━ APP PREVIEW ━━━ */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <Reveal>
          <div className="text-center mb-10">
            <h2 className="text-[28px] md:text-[32px] font-bold mb-3" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
              Une vue claire. Immédiatement.
            </h2>
            <p className="text-[15px]" style={{ color: '#475569' }}>
              Vos dossiers, vos délais et vos urgences. En un seul endroit.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <motion.div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid #E2E8F0',
              boxShadow: '0 25px 80px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.04)',
            }}
            whileHover={{ y: -4, boxShadow: '0 30px 90px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.06)' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* macOS bar */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FECACA' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FDE68A' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#BBF7D0' }} />
              <div
                className="flex-1 mx-4 rounded text-center text-[11px]"
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '3px 12px', color: '#94A3B8' }}
              >
                ordo.ca/tableau-de-bord
              </div>
            </div>

            {/* Dashboard mock */}
            <div className="flex" style={{ height: 420, background: '#F8FAFC' }}>
              <div className="w-48 shrink-0 flex-col hidden md:flex" style={{ background: '#FFFFFF', borderRight: '1px solid #E2E8F0' }}>
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
          </motion.div>
        </Reveal>
      </section>

      <WavePath />

      {/* ━━━ PROBLEM → SOLUTION ━━━ */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <Reveal>
          <p className="text-center text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
            Le constat
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Reveal delay={0.1}>
            <div
              className="rounded-2xl p-8 h-full transition-all duration-300"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <p className="text-[12px] font-semibold uppercase tracking-widest mb-5" style={{ color: '#DC2626' }}>
                Le problème
              </p>
              <ul className="space-y-4">
                {problems.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3 text-[14px]"
                    style={{ color: '#0F172A' }}
                  >
                    <X size={16} className="shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div
              className="rounded-2xl p-8 h-full transition-all duration-300"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
            >
              <p className="text-[12px] font-semibold uppercase tracking-widest mb-5" style={{ color: '#16A34A' }}>
                La solution
              </p>
              <ul className="space-y-4">
                {solutions.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3 text-[14px]"
                    style={{ color: '#0F172A' }}
                  >
                    <CheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ CORE FEATURES (3 blocs) ━━━ */}
      <section id="features" className="py-20" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <p className="text-center text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
              Fonctionnalités
            </p>
            <h2 className="text-center text-[28px] md:text-[32px] font-bold mb-12" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
              L'essentiel, parfaitement exécuté.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <Reveal key={title} delay={0.1 + i * 0.1}>
                <motion.div
                  className="rounded-2xl p-6 h-full cursor-default"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                  }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                    borderColor: '#CBD5E1',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${color}10` }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <p className="text-[15px] font-semibold mb-2" style={{ color: '#0F172A' }}>{title}</p>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>{desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ DETAILED FEATURES (6 small) ━━━ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {detailedFeatures.map(({ icon: Icon, title, desc, color }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="flex items-start gap-3.5 p-4 rounded-xl transition-colors duration-200 hover:bg-slate-50">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}10` }}
                  >
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold mb-1" style={{ color: '#0F172A' }}>{title}</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: '#475569' }}>{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ METRICS ━━━ */}
      <section style={{ background: '#0F172A' }} className="py-20">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 0.1}>
              <div>
                <p className="text-[36px] md:text-[42px] font-bold mb-1" style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}>
                  {value}
                </p>
                <p className="text-[13px]" style={{ color: '#64748B' }}>{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ━━━ DIFFERENTIATION ━━━ */}
      <section className="py-20" style={{ background: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <p className="text-center text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
              Pourquoi Ordo
            </p>
            <h2 className="text-center text-[28px] md:text-[32px] font-bold mb-4" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
              Pensé pour le Québec.
            </h2>
            <p className="text-center text-[15px] max-w-xl mx-auto mb-12" style={{ color: '#475569' }}>
              Contrairement aux outils génériques, Ordo comprend votre pratique.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Français juridique', desc: 'Interface entièrement en français, avec le vocabulaire du droit québécois.' },
              { title: 'Réalités locales', desc: 'Adapté aux cabinets québécois : délais spécifiques, pratiques courantes, vocabulaire juridique local.' },
              { title: 'Simple par design', desc: 'Pas de département IT requis. Opérationnel en 10 minutes, maîtrisé en une heure.' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={0.1 + i * 0.1}>
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                >
                  <p className="text-[15px] font-semibold mb-2" style={{ color: '#0F172A' }}>{item.title}</p>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-[1fr_1.5fr]">
            <Reveal>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
                  FAQ
                </p>
                <h2 className="text-[28px] md:text-[32px] font-bold mb-4" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
                  Questions<br />fréquentes
                </h2>
                <p className="text-[14px] leading-relaxed" style={{ color: '#475569' }}>
                  Tout ce que vous devez savoir pour commencer avec Ordo.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
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
      <section style={{ background: '#0F172A' }} className="py-24 relative overflow-hidden">
        {/* Glow effect */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <Reveal>
            <p className="text-[12px] font-semibold uppercase tracking-widest mb-4" style={{ color: '#475569' }}>
              Accès bêta gratuit
            </p>
            <h2 className="text-[32px] md:text-[40px] font-bold mb-4" style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              Reprenez le contrôle<br />de vos délais.
            </h2>
            <p className="text-[15px] mb-10" style={{ color: '#64748B' }}>
              Commencez gratuitement. Aucun engagement.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[14px] transition-all duration-300"
              style={{
                background: '#FFFFFF',
                color: '#0F172A',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.4), 0 0 40px rgba(59,130,246,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              Accès bêta gratuit
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer style={{ background: '#0F172A', color: '#FFFFFF', borderTop: '1px solid #1E293B' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 mb-12">

            {/* Brand block */}
            <div>
              <OrdoLogo />
              <p className="text-[13px] leading-relaxed mt-4 max-w-xs" style={{ color: '#475569' }}>
                Ordo aide les avocats québécois à ne jamais rater un délai juridique. Extraction automatique, vue claire, rappels intelligents.
              </p>
              <a
                href="mailto:flowmatic.ca@gmail.com"
                className="inline-flex items-center gap-2 mt-5 text-[13px] transition-colors"
                style={{ color: '#64748B' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
              >
                flowmatic.ca@gmail.com
              </a>
            </div>

            {/* Produit */}
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-widest mb-5" style={{ color: '#334155' }}>
                Produit
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-[13px] transition-colors text-left"
                    style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
                  >
                    Fonctionnalités
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-[13px] transition-colors text-left"
                    style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:flowmatic.ca@gmail.com"
                    className="text-[13px] transition-colors"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-widest mb-5" style={{ color: '#334155' }}>
                Légal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/confidentialite"
                    className="text-[13px] transition-colors"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
                  >
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    to="/conditions"
                    className="text-[13px] transition-colors"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
                  >
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rgpd"
                    className="text-[13px] transition-colors"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
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
            style={{ borderTop: '1px solid #1E293B' }}
          >
            <p className="text-[12px]" style={{ color: '#334155' }}>
              © {new Date().getFullYear()} Ordo. Tous droits réservés.
            </p>
            <p className="text-[12px]" style={{ color: '#334155' }}>
              Données hébergées au Canada · Conçu pour les avocats québécois
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
