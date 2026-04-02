import BottomNav from './BottomNav'

// Wrapper for displaying the bottom navigation bar across every authenticated pages

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1" style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))',
            }}>
                {children}
            </main>
            <BottomNav />
        </div>
    )
}