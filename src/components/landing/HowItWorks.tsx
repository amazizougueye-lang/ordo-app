import { motion } from 'framer-motion'
import { Upload, Zap, Bell } from 'lucide-react'

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

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Déposez vos documents',
      desc: 'Importez vos dossiers en PDF ou email. Ordo les organise automatiquement.',
      icon: Upload,
      color: '#3B82F6',
    },
    {
      number: '02',
      title: 'L\'IA extrait les délais',
      desc: 'Reconnaissance intelligente des dates clés. Zéro saisie manuelle requise.',
      icon: Zap,
      color: '#D97706',
    },
    {
      number: '03',
      title: 'Reçois des rappels',
      desc: 'Chaque matin, un email scannable en 10 secondes. Jamais oublier un délai.',
      icon: Bell,
      color: '#10B981',
    },
  ]

  return (
    <section className="py-24 px-6" style={{ background: '#F8FAFC' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-center text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
            Comment ça marche
          </p>
          <h2 className="text-center text-[32px] md:text-[40px] font-bold mb-16" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
            3 étapes simples.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <Reveal key={step.number} delay={0.1 + i * 0.1}>
                <motion.div
                  className="relative flex flex-col items-center text-center"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Numero */}
                  <p className="text-[64px] md:text-[72px] font-black mb-4" style={{ color: '#E2E8F0', lineHeight: 0.9 }}>
                    {step.number}
                  </p>

                  {/* Icon circle */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                    style={{ background: `${step.color}15`, border: `2px solid ${step.color}30` }}
                  >
                    <Icon size={28} style={{ color: step.color }} />
                  </div>

                  {/* Title + Desc */}
                  <p className="text-[16px] font-bold mb-3" style={{ color: '#0F172A' }}>
                    {step.title}
                  </p>
                  <p className="text-[14px] leading-relaxed" style={{ color: '#475569' }}>
                    {step.desc}
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
