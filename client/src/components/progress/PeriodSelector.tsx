interface Props {
    value: string
    onChange: (period: string) => void
}

const PERIODS = [
    { value: 'week', label: '7D' },
    { value: 'month', label: '1M' },
    { value: '3months', label: '3M' },
    { value: 'all', label: 'All' },
]

// Component to select the period

export default function PeriodSelector({ value, onChange }: Props) {
    return (
        <div className="flex rounded-xl border border-border bg-card p-1 gap-1">
            {PERIODS.map((p) => (
                <button
                    key={p.value}
                    onClick={() => onChange(p.value)}
                    className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${value === p.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    )
}