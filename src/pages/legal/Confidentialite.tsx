import { Link } from 'react-router-dom'
import { OrdoLogo } from '../../components/OrdoLogo'
import { ArrowLeft } from 'lucide-react'

export default function Confidentialite() {
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
          Politique de confidentialité
        </h1>
        <p className="text-[13px] mb-12" style={{ color: '#94A3B8' }}>Dernière mise à jour : avril 2026</p>

        <div className="space-y-10" style={{ color: '#475569', fontSize: 14, lineHeight: 1.8 }}>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>1. Données collectées</h2>
            <p>Ordo collecte uniquement les données nécessaires au fonctionnement du service : votre adresse courriel, les documents PDF que vous téléversez, ainsi que les délais et informations de dossiers que vous saisissez.</p>
            <p className="mt-3">Nous ne collectons pas de données personnelles sensibles au sens de la Loi 25 (Québec) sans consentement explicite.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>2. Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="mt-3 space-y-2 pl-4" style={{ listStyleType: 'disc' }}>
              <li>Afficher et organiser vos dossiers et délais</li>
              <li>Vous envoyer des rappels quotidiens si vous les activez</li>
              <li>Extraire automatiquement les délais de vos documents</li>
            </ul>
            <p className="mt-3">Vos données ne sont <strong style={{ color: '#0F172A' }}>jamais</strong> utilisées pour entraîner des modèles d'intelligence artificielle, vendues à des tiers, ou partagées sans votre consentement.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>3. Hébergement et sécurité</h2>
            <p>Toutes vos données sont hébergées au Canada, sur des serveurs sécurisés conformes aux exigences de la Loi 25 québécoise. Les données sont chiffrées en transit (TLS) et au repos.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>4. Conservation des données</h2>
            <p>Vos données sont conservées tant que votre compte est actif. Lors de la suppression de votre compte, toutes vos données sont effacées de nos systèmes dans un délai de 30 jours.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>5. Vos droits</h2>
            <p>Conformément à la Loi 25, vous avez le droit d'accéder à vos données, de les corriger, de les supprimer et de vous opposer à leur traitement. Pour exercer ces droits, contactez-nous à :</p>
            <a href="mailto:flowmatic.ca@gmail.com" className="inline-block mt-3 font-medium transition-colors" style={{ color: '#3B82F6' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}
            >
              flowmatic.ca@gmail.com
            </a>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>6. Cookies</h2>
            <p>Ordo utilise uniquement des cookies fonctionnels nécessaires à l'authentification. Aucun cookie publicitaire ou de traçage n'est utilisé.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>7. Contact</h2>
            <p>Pour toute question relative à cette politique :</p>
            <a href="mailto:flowmatic.ca@gmail.com" className="inline-block mt-2 font-medium transition-colors" style={{ color: '#3B82F6' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}
            >
              flowmatic.ca@gmail.com
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
