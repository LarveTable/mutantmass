import { NavLink } from 'react-router-dom'
import { Dumbbell, History, TrendingUp, User, Home } from 'lucide-react'

// The pages the user can access

const links = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/workout', icon: Dumbbell, label: 'Workout' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/progress', icon: TrendingUp, label: 'Progress' },
    { to: '/profile', icon: User, label: 'Profile' },
]

// The component used to display the bottom navigation bar
// This component is displayed only on authenticated page

export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex h-14 items-center justify-around px-2">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                            }`
                        }
                    >
                        <Icon size={22} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}