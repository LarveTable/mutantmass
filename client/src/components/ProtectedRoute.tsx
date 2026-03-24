import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// A wrapper to be put aorund routes that need auth, it checks if the user is authenticated before rendering the child component
// If the user is not authenticated, it redirects to the login page
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    // Show loading while checking authentication
    if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
    if (!user) return <Navigate to="/login" replace />

    return <>{children}</>
}