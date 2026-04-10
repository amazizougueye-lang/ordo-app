import { Link } from 'react-router-dom'
import { OrdoLogo } from '../../components/OrdoLogo'
import { ArrowLeft } from 'lucide-react'

export default function Rgpd() {
  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0' }}
      >
        <OrdoLogo />
        <Link to="/" className="flex items-center gap-2 text-[13px] transition-colors" style={{ color: '#94A3B8' }}
          onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
          onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
        >
          <ArrowLeft size={14} /> Retour
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>Légal</p>
        <h1 className="text-[32px] font-bold mb-2" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
          Protection des données (RGPD / Loi 25)
        </h1>
        <p className="text-[13px] mb-12" style={{ color: '#94A3B8' }}>Dernière mise à jour : avril 2026</p>

        <div className="space-y-10" style={{ color: '#475569', fontSize: 14, lineHeight: 1.8 }}>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>Conformité applicable</h2>
            <p>Ordo se conforme à la <strong style={{ color: '#0F172A' }}>Loi 25</strong> (Loi modernisant des dispositions législatives en matière de protection des renseignements personnels, Québec) ainsi qu'aux principes du <strong style={{ color: '#0F172A' }}>RGPD</strong> européen pour les utilisateurs concernés.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>Responsable du traitement</h2>
            <p>Le responsable du traitement des données est l'équipe Ordo, joignable à :</p>
            <a href="mailto:flowmatic.ca@gmail.com" className="inline-block mt-2 font-medium transition-colors" style={{ color: '#3B82F6' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}
            >
              flowmatic.ca@gmail.com
            </a>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>Base légale du traitement</h2>
            <p>Le traitement de vos données repose sur :</p>
            <ul className="mt-3 space-y-2 pl-4" style={{ listStyleType: 'disc' }}>
              <li><strong style={{ color: '#0F172A' }}>Consentement</strong> : lors de la création de votre compte</li>
              <li><strong style={{ color: '#0F172A' }}>Exécution du contrat</strong> : pour la fourniture du service Ordo</li>
              <li><strong style={{ color: '#0F172A' }}>Intérêt légitime</strong> : amélioration de la sécurité et de la stabilité du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>Vos droits</h2>
            <p>Conformément à la Loi 25 et au RGPD, vous disposez des droits suivants :</p>
            <ul className="mt-3 space-y-2 pl-4" style={{ listStyleType: 'disc' }}>
              <li><strong style={{ color: '#0F172A' }}>Accès</strong> : obtenir une copie de vos données personnelles</li>
              <li><strong style={{ color: '#0F172A' }}>Rectification</strong> : corriger des données inexactes</li>
              <li><strong style={{ color: '#0F172A' }}>Suppression</strong> : demander l'effacement de vos données</li>
              <li><strong style={{ color: '#0F172A' }}>Portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong style={{ color: '#0F172A' }}>Opposition</strong> : vous opposer à certains traitements</li>
              <li><strong style={{ color: '#0F172A' }}>Limitation</strong> : restreindre le traitement dans certains cas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>Transferts de données</h2>
            <p>Toutes vos données sont hébergées au Canada. Aucun transfert vers des pays tiers sans protection adéquate n'est effectué.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>Conservation</h2>
            <p>Vos données sont conservées pour la durée de vie de votre compte. En cas de suppression du compte, les données sont effacées dans un délai maximum de 30 jours.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>Exercer vos droits</h2>
            <p>Pour toute demande relative à vos droits, contactez-nous à :</p>
            <a href="mailto:flowmatic.ca@gmail.com?subject=Demande RGPD / Loi 25" className="inline-block mt-2 font-medium transition-colors" style={{ color: '#3B82F6' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}
            >
              flowmatic.ca@gmail.com
            </a>
            <p className="mt-3">Nous répondons dans un délai de 30 jours.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
