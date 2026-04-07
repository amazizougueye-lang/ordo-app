import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { OrdoLogo } from '../components/OrdoLogo'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Vérifiez votre email pour confirmer votre compte')
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F8FAFC' }}
    >
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-10">
          <OrdoLogo size="lg" />
        </div>

        <div className="card p-8">
          <h1
            className="text-[22px] font-semibold mb-1"
            style={{ color: '#0F172A', letterSpacing: '-0.02em' }}
          >
            Accès beta
          </h1>
          <p className="text-[13px] mb-7" style={{ color: '#94A3B8' }}>
            Créez votre compte Ordo
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email professionnel</label>
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
                placeholder="8 caractères minimum"
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
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] mt-5" style={{ color: '#94A3B8' }}>
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium" style={{ color: '#1E293B' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
