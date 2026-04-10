import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '@/context/LanguageContext'

// A wrapper to be put aorund routes that need auth, it checks if the user is authenticated before rendering the child component
// If the user is not authenticated, it redirects to the login page
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const { t } = useTranslation()

    // Show loading while checking authentication
    if (loading) return <div className="flex min-h-screen items-center justify-center">{t.common.loading}</div>
    if (!user) return <Navigate to="/login" replace />

    return <>{children}</>
}