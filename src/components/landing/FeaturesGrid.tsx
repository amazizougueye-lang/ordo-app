import { motion } from 'framer-motion'
import { Eye, Zap, Lock, Search, Mail, Shield } from 'lucide-react'

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
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
      color: '#DC2626',
    },
    {
      icon: Zap,
      title: 'Automatisation intelligente',
      desc: 'Extraction IA des délais, centralisation des dossiers, moins de saisie manuelle.',
      color: '#3B82F6',
    },
    {
      icon: Lock,
      title: 'Rester en contrôle',
      desc: 'Validation par l\'avocat avant toute action. Rappels quotidiens et organisation fiable.',
      color: '#10B981',
    },
    {
      icon: Search,
      title: 'Recherche instantanée',
      desc: 'Retrouvez n\'importe quel dossier en secondes. Filtres intelligents par statut, délai, client.',
      color: '#D97706',
    },
    {
      icon: Mail,
      title: 'Intégration email',
      desc: 'Reçoivent vos délais par courriel chaque matin. Scannable en 10 secondes, actionnable immédiatement.',
      color: '#8B5CF6',
    },
    {
      icon: Shield,
      title: 'Conforme à la Loi 25',
      desc: 'Vos données ne servent jamais à entraîner un modèle. Hébergement au Canada, chiffrement de bout en bout.',
      color: '#0F172A',
    },
  ]

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-center text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
            Fonctionnalités
          </p>
          <h2 className="text-center text-[32px] md:text-[40px] font-bold mb-16" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
            Tout ce dont vous avez besoin.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Reveal key={feature.title} delay={0.05 + i * 0.05}>
                <motion.div
                  className="rounded-2xl p-8 h-full cursor-default"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                  }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.06)',
                    borderColor: '#CBD5E1',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: `${feature.color}15` }}
                  >
                    <Icon size={20} style={{ color: feature.color }} strokeWidth={2} />
                  </div>
                  <p className="text-[16px] font-bold mb-3" style={{ color: '#0F172A' }}>
                    {feature.title}
                  </p>
                  <p className="text-[14px] leading-relaxed" style={{ color: '#475569' }}>
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
