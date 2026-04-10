import { motion } from 'framer-motion'

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

export function MetricsSection() {
  const stats = [
    { value: '10 min', label: 'pour être opérationnel' },
    { value: '< 10s', label: 'pour comprendre un dossier' },
    { value: '0', label: 'compétence IT requise' },
    { value: '100%', label: 'en français juridique québécois' },
  ]

  return (
    <section style={{ background: '#0F172A' }} className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:gap-12">
          {stats.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 0.1}>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                <p className="text-[48px] md:text-[56px] font-black mb-2" style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}>
                  {value}
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: '#64748B' }}>
                  {label}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
