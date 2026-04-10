import { Link } from 'react-router-dom'
import { OrdoLogo } from '../../components/OrdoLogo'
import { ArrowLeft } from 'lucide-react'

export default function Conditions() {
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
          Conditions d'utilisation
        </h1>
        <p className="text-[13px] mb-12" style={{ color: '#94A3B8' }}>Dernière mise à jour : avril 2026</p>

        <div className="space-y-10" style={{ color: '#475569', fontSize: 14, lineHeight: 1.8 }}>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>1. Acceptation des conditions</h2>
            <p>En utilisant Ordo, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>2. Description du service</h2>
            <p>Ordo est un outil de gestion de délais juridiques destiné aux avocats et professionnels du droit au Québec. Le service permet de centraliser, organiser et suivre les délais associés à vos dossiers.</p>
            <p className="mt-3"><strong style={{ color: '#0F172A' }}>Important :</strong> Ordo est un outil d'organisation et non un avis juridique. L'avocat reste seul responsable de la gestion de ses délais et obligations professionnelles.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>3. Accès au service</h2>
            <p>L'accès à Ordo requiert la création d'un compte avec une adresse courriel valide. Vous êtes responsable de la confidentialité de vos identifiants de connexion.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>4. Utilisation acceptable</h2>
            <p>Vous vous engagez à utiliser Ordo uniquement à des fins légales et professionnelles. Il est interdit de :</p>
            <ul className="mt-3 space-y-2 pl-4" style={{ listStyleType: 'disc' }}>
              <li>Téléverser des documents sans en avoir les droits</li>
              <li>Tenter d'accéder aux données d'autres utilisateurs</li>
              <li>Utiliser le service à des fins frauduleuses</li>
              <li>Contourner les mesures de sécurité du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>5. Responsabilité</h2>
            <p>Ordo est fourni « tel quel » en version bêta. Nous nous efforçons d'assurer la disponibilité et l'exactitude du service, mais nous ne pouvons garantir l'absence d'interruptions ou d'erreurs.</p>
            <p className="mt-3">Ordo ne saurait être tenu responsable des conséquences d'un délai manqué. L'avocat demeure seul responsable de la gestion de ses obligations professionnelles.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>6. Propriété intellectuelle</h2>
            <p>Le service Ordo, son interface et ses fonctionnalités sont la propriété exclusive de leurs développeurs. Vos documents et données restent votre propriété.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>7. Modification des conditions</h2>
            <p>Nous nous réservons le droit de modifier ces conditions. Les utilisateurs seront informés par courriel en cas de changement significatif.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0F172A' }}>8. Contact</h2>
            <p>Pour toute question relative à ces conditions :</p>
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
