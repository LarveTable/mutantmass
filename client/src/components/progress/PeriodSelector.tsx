import { useTranslation } from '@/context/LanguageContext'

interface Props {
    value: string
    onChange: (period: string) => void
}

export default function PeriodSelector({ value, onChange }: Props) {
    const { t } = useTranslation()
    const PERIODS = [
        { value: 'week', label: t.progress.periods.week },
        { value: 'month', label: t.progress.periods.month },
        { value: '3months', label: t.progress.periods.threeMonths },
        { value: 'all', label: t.progress.periods.all },
    ]
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