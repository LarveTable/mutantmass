import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

// Component to display rest timer

interface Props {
    duration: number // in seconds
    onComplete: () => void
    onDismiss: () => void
}

export default function RestTimer({ duration, onComplete, onDismiss }: Props) {
    const [remaining, setRemaining] = useState(duration)

    useEffect(() => {
        setRemaining(duration)
    }, [duration])

    useEffect(() => {
        if (remaining <= 0) {
            onComplete()
            return
        }
        const interval = setInterval(() => {
            setRemaining((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [remaining, onComplete])

    const progress = ((duration - remaining) / duration) * 100

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div
            className="fixed left-4 right-4 z-50 rounded-2xl border border-border bg-card p-4 shadow-lg"
            style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Rest Timer</p>
                <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
                    <X size={18} />
                </button>
            </div>

            <div className="flex items-center justify-between mb-3">
                <span className="text-4xl font-bold tabular-nums">
                    {formatTime(remaining)}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setRemaining((r) => Math.max(0, r - 15))}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                    >
                        -15s
                    </button>
                    <button
                        onClick={() => setRemaining((r) => r + 15)}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                    >
                        +15s
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}