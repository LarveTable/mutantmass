import BottomNav from './BottomNav'

// Wrapper for displaying the bottom navigation bar across every authenticated pages

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1 pb-16">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}