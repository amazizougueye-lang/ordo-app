import { motion } from 'framer-motion'
import { Eye, Zap, Lock, Search, Mail, Shield } from 'lucide-react'

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function FeaturesGrid() {
  const features = [
    {
      icon: Eye,
      title: 'Tout voir en un coup d\'oeil',
      desc: 'Vue Aujourd\'hui avec urgences visibles et statuts clairs. Comprenez en 10 secondes ce qui est urgent.',
      color: '#dc2626',
      bg: '#fef2f2',
    },
    {
      icon: Zap,
      title: 'Automatisation intelligente',
      desc: 'Extraction IA des délais, centralisation des dossiers, moins de saisie manuelle.',
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      icon: Lock,
      title: 'Rester en contrôle',
      desc: 'Validation par l\'avocat avant toute action. Rappels quotidiens et organisation fiable.',
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      icon: Search,
      title: 'Recherche instantanée',
      desc: 'Retrouvez n\'importe quel dossier en secondes. Filtres intelligents par statut, délai, client.',
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      icon: Mail,
      title: 'Intégration email',
      desc: 'Recevez vos délais par courriel chaque matin. Scannable en 10 secondes, actionnable immédiatement.',
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
    {
      icon: Shield,
      title: 'Conforme à la Loi 25',
      desc: 'Vos données ne servent jamais à entraîner un modèle. Hébergement au Canada, chiffrement de bout en bout.',
      color: '#1a1a2e',
      bg: '#f1f5f9',
    },
  ]

  return (
    <section id="features" className="py-28 px-6" style={{ background: '#FAFBFC' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#9ca3af' }}>
            Fonctionnalités
          </p>
          <h2 className="text-center text-[26px] md:text-[36px] font-semibold mb-16" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
            Tout ce dont vous avez besoin.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Reveal key={feature.title} delay={0.04 + i * 0.04}>
                <motion.div
                  className="rounded-2xl p-8 h-full cursor-default"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                  whileHover={{
                    y: -2,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
                    borderColor: 'rgba(0,0,0,0.08)',
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: feature.bg }}
                  >
                    <Icon size={18} style={{ color: feature.color }} strokeWidth={2} />
                  </div>
                  <p className="text-[15px] font-semibold mb-2.5" style={{ color: '#1a1a2e' }}>
                    {feature.title}
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#5a6577' }}>
                    {feature.desc}
                  </p>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
