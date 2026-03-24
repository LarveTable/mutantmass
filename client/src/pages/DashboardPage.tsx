import { useAuth } from '../hooks/useAuth'

// Dashboard page, only accessible if the user is authenticated
export default function DashboardPage() {
    const { user, logout } = useAuth()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
            <button onClick={logout} className="text-sm text-muted-foreground underline">
                Logout
            </button>
        </div>
    )
}