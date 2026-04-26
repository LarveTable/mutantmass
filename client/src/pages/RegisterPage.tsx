import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '@/context/LanguageContext'
import { LanguageToggle } from '@/components/LanguageSelector'
import './mutant-auth.css'

// Register page, only accessible if the user is not authenticated

export default function RegisterPage() {
    const { register, user, loading: authLoading } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [betaCode, setBetaCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // If user logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard')
        }
    }, [authLoading, user, navigate])

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError('')
        if (password !== confirm) {
            setError(t.auth.register.errorMatch)
            return
        }
        if (password.length < 8) {
            setError(t.auth.register.errorMinChars)
            return
        }
        setLoading(true)
        try {
            await register(email, password, name, betaCode)
            navigate('/dashboard')
        } catch (error: any) {
            setError(error.response?.data?.error ?? t.profile.common.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mutant-login-theme w-full">

            <div className="lang-toggle-fixed">
                <LanguageToggle variant="neon" />
            </div>

            <div className="bg-glow glow-cyan"></div>
            <div className="bg-glow glow-purple"></div>
            <div className="bg-glow glow-green-top"></div>
            <div className="bg-glow glow-green-bottom"></div>
            <div className="bg-ring ring-tl"></div>
            <div className="bg-ring ring-tr"></div>
            <div className="bg-ring ring-bl"></div>
            <div className="bg-ring ring-br"></div>

            <div className="alien-logo-container">
                <img src="/icons/icon-512.png" alt={t.auth.common.logoAlt} className="w-[100px] h-[100px]" />
            </div>

            <div className="login-wrapper">
                <svg className="circuit-tr" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="neon-glow-tr" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                    <path d="M 10 10 Q 50 10 70 40 T 70 140 Q 70 160 40 190" stroke="#00ff87" strokeWidth="2" fill="none" filter="url(#neon-glow-tr)" style={{ opacity: 0.8 }} />
                    <path d="M 20 20 Q 40 20 55 45 T 55 110" stroke="#00e5ff" strokeWidth="1.5" fill="none" filter="url(#neon-glow-tr)" style={{ opacity: 0.6 }} />
                    <circle cx="10" cy="10" r="3" fill="#00ff87" filter="url(#neon-glow-tr)" />
                    <circle cx="40" cy="190" r="3" fill="#00ff87" filter="url(#neon-glow-tr)" />
                </svg>

                <svg className="circuit-bl" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="neon-glow-bl" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                    <path d="M 90 190 Q 50 190 30 160 T 30 60 Q 30 40 60 10" stroke="#00ff87" strokeWidth="2" fill="none" filter="url(#neon-glow-bl)" style={{ opacity: 0.8 }} />
                    <path d="M 80 180 Q 60 180 45 155 T 45 90" stroke="#00e5ff" strokeWidth="1.5" fill="none" filter="url(#neon-glow-bl)" style={{ opacity: 0.6 }} />
                    <circle cx="60" cy="10" r="3" fill="#00ff87" filter="url(#neon-glow-bl)" />
                    <circle cx="90" cy="190" r="3" fill="#00ff87" filter="url(#neon-glow-bl)" />
                </svg>

                <div className="login-card">
                    <h1 className="brand-title">Mutant Mass</h1>
                    <h2 className="welcome-title">{t.auth.register.title}</h2>
                    <p className="welcome-subtitle">{t.auth.register.description}</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">{t.common.name}</label>
                                <input type="text" id="name" className="form-control" placeholder={t.auth.register.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">{t.auth.common.email}</label>
                                <input type="email" id="email" className="form-control" placeholder={t.auth.common.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">{t.auth.common.password}</label>
                                <input type="password" id="password" className="form-control" placeholder={t.auth.common.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirm">{t.auth.register.confirmPassword}</label>
                                <input type="password" id="confirm" className="form-control" placeholder={t.auth.common.passwordPlaceholder} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="betaCode">{t.auth.register.betaCode}</label>
                            <input type="text" id="betaCode" className="form-control" placeholder={t.auth.register.betaCodePlaceholder} value={betaCode} onChange={(e) => setBetaCode(e.target.value)} required />
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? t.auth.register.submitting : t.auth.register.submit}
                        </button>

                        {error && <p className="error-text">{error}</p>}

                        <div className="signup-link">
                            {t.auth.register.hasAccount}{' '}
                            <Link to="/login">
                                {t.auth.register.loginLink}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}