import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/context/LanguageContext'

// Component to show a weekly calendar for the history page

interface Props {
    currentWeekStart: Date
    workoutDates: string[] // ISO date strings
    selectedDate: string | null
    onSelectDate: (date: string) => void
    onPrevWeek: () => void
    onNextWeek: () => void
}


function getWeekDays(weekStart: Date): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        return d
    })
}

function toDateString(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function isToday(date: Date): boolean {
    return toDateString(date) === toDateString(new Date())
}

export default function WeeklyCalendar({
    currentWeekStart,
    workoutDates,
    selectedDate,
    onSelectDate,
    onPrevWeek,
    onNextWeek,
}: Props) {
    const { t, lang } = useTranslation()
    const days = getWeekDays(currentWeekStart)
    const workoutDateSet = new Set(workoutDates.map(d => d.split('T')[0]))

    const monthLabel = currentWeekStart.toLocaleDateString(lang, {
        month: 'long',
        year: 'numeric',
    })

    return (
        <div className="flex flex-col gap-3">
            {/* Month + navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onPrevWeek}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold">{monthLabel}</span>
                <button
                    onClick={onNextWeek}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Day columns */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const dateStr = toDateString(day)
                    const hasWorkout = workoutDateSet.has(dateStr)
                    const isSelected = selectedDate === dateStr
                    const today = isToday(day)

                    return (
                        <button
                            key={dateStr}
                            onClick={() => hasWorkout && onSelectDate(dateStr)}
                            disabled={!hasWorkout}
                            className={`flex flex-col items-center gap-1.5 rounded-xl py-2 transition-colors ${isSelected
                                ? 'bg-primary text-primary-foreground'
                                : today
                                    ? 'border border-primary text-foreground'
                                    : 'text-muted-foreground'
                                } ${hasWorkout && !isSelected ? 'hover:bg-accent cursor-pointer' : ''} ${!hasWorkout ? 'opacity-40 cursor-default' : ''
                                }`}
                        >
                            <span className="text-xs">{t.history.calendar.days[i]}</span>
                            <span className="text-sm font-semibold">{day.getDate()}</span>
                            {hasWorkout && (
                                <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'
                                    }`} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}