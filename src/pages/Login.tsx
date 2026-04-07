import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { OrdoLogo } from '../components/OrdoLogo'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Email ou mot de passe incorrect')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F8FAFC' }}
    >
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <OrdoLogo size="lg" />
        </div>

        {/* Card */}
        <div className="card p-8">
          <h1
            className="text-[22px] font-semibold mb-1"
            style={{ color: '#0F172A', letterSpacing: '-0.02em' }}
          >
            Connexion
          </h1>
          <p className="text-[13px] mb-7" style={{ color: '#94A3B8' }}>
            Accédez à vos dossiers
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="vous@cabinet.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="field-label">Mot de passe</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
              style={{ height: 40 }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] mt-5" style={{ color: '#94A3B8' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium" style={{ color: '#1E293B' }}>
            Demander l'accès beta
          </Link>
        </p>
      </div>
    </div>
  )
}
