import { motion } from 'framer-motion'
import { Upload, Zap, Bell } from 'lucide-react'

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

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Déposez vos documents',
      desc: 'Importez vos dossiers en PDF ou email. Ordo les organise automatiquement.',
      icon: Upload,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      number: '02',
      title: 'L\'IA extrait les délais',
      desc: 'Reconnaissance intelligente des dates clés. Zéro saisie manuelle requise.',
      icon: Zap,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      number: '03',
      title: 'Recevez des rappels',
      desc: 'Chaque matin, un email scannable en 10 secondes. Jamais oublier un délai.',
      icon: Bell,
      color: '#059669',
      bg: '#ecfdf5',
    },
  ]

  return (
    <section className="py-28 px-6" style={{ background: '#f8f9fa' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#9ca3af' }}>
            Comment ça marche
          </p>
          <h2 className="text-center text-[26px] md:text-[36px] font-semibold mb-16" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
            3 étapes simples.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <Reveal key={step.number} delay={0.08 + i * 0.08}>
                <motion.div
                  className="relative flex flex-col items-center text-center"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Number */}
                  <p className="text-[56px] md:text-[64px] font-bold mb-4" style={{ color: '#e5e7eb', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
                    {step.number}
                  </p>

                  {/* Icon circle */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                    style={{ background: step.bg, border: `1.5px solid ${step.color}20` }}
                  >
                    <Icon size={22} style={{ color: step.color }} strokeWidth={2} />
                  </div>

                  {/* Title + Desc */}
                  <p className="text-[15px] font-semibold mb-2.5" style={{ color: '#1a1a2e' }}>
                    {step.title}
                  </p>
                  <p className="text-[13px] leading-relaxed max-w-[240px]" style={{ color: '#5a6577' }}>
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
