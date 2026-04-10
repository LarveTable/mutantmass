import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTranslation } from '@/context/LanguageContext'
import { LanguageToggle } from '@/components/LanguageSelector'

// Login page, only accessible if the user is not authenticated

export default function LoginPage() {
    const { login, user, loading: authLoading } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
        setLoading(true)
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (error: any) {
            setError(error.response?.data?.error ?? t.auth.login.errorInvalid)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 gap-6">
            <LanguageToggle />
            <div className="flex flex-col items-center gap-2">
                <img src="/icons/icon-512.png" alt={t.auth.common.logoAlt} className="h-16 w-16 rounded-2xl drop-shadow-lg" />
                <h1 className="text-3xl font-black tracking-tight">Mutant Mass</h1>
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">{t.auth.login.title}</CardTitle>
                    <CardDescription>{t.auth.login.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">{t.auth.common.email}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t.auth.common.emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">{t.auth.common.password}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t.auth.common.passwordPlaceholder}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t.auth.login.signingIn : t.auth.login.submit}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            {t.auth.login.noAccount}{' '}
                            <Link to="/register" className="text-foreground underline">
                                {t.auth.login.registerLink}
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}