import { NavLink } from 'react-router-dom'
import { Dumbbell, History, TrendingUp, User, Home } from 'lucide-react'
import { useTranslation } from '@/context/LanguageContext'

// The pages the user can access

const navLinks = [
    { to: '/dashboard', icon: Home, key: 'home' },
    { to: '/workout', icon: Dumbbell, key: 'workout' },
    { to: '/history', icon: History, key: 'history' },
    { to: '/progress', icon: TrendingUp, key: 'progress' },
    { to: '/profile', icon: User, key: 'profile' },
] as const

// The component used to display the bottom navigation bar
// This component is displayed only on authenticated page

export default function BottomNav() {
    const { t } = useTranslation()
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex h-14 items-center justify-around px-2">
                {navLinks.map(({ to, icon: Icon, key }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                            }`
                        }
                    >
                        <Icon size={22} />
                        <span>{t.nav[key as keyof typeof t.nav]}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}