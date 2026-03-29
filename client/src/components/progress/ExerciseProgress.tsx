import { useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts'
import { useExerciseStats, useExercises } from '@/hooks/useWorkout'
import { ChevronDown, X } from 'lucide-react'

interface Props {
    period: string
}

// Component to display the progress of an exercise

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow">
            <p className="text-muted-foreground">{payload[0].payload.date}</p>
            <p className="text-primary font-semibold">{payload[0].value} kg (e1RM)</p>
            <p className="text-muted-foreground text-xs">
                {payload[0].payload.bestWeight}kg × {payload[0].payload.bestReps} reps
            </p>
        </div>
    )
}

export default function ExerciseProgress({ period }: Props) {
    const [selectedExercise, setSelectedExercise] = useState<any>(null)
    const [search, setSearch] = useState('')
    const [pickerOpen, setPickerOpen] = useState(false)

    const { data: exercises = [] } = useExercises()
    const { data = [], isLoading } = useExerciseStats(selectedExercise?.id ?? null, period)

    const filtered = exercises.filter((e: any) =>
        e.name.toLowerCase().includes(search.toLowerCase()) &&
        e.type === 'WEIGHTED'
    )

    return (
        <div className="flex flex-col gap-3 h-full">
            {/* Exercise picker */}
            <div className="relative">
                {selectedExercise ? (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                        <span className="text-sm font-medium">{selectedExercise.name}</span>
                        <button
                            onClick={() => setSelectedExercise(null)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setPickerOpen((v) => !v)}
                        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <span>Select an exercise...</span>
                        <ChevronDown size={16} />
                    </button>
                )}

                {pickerOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                        <div className="p-2 border-b border-border">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filtered.slice(0, 10).map((e: any) => (
                                <button
                                    key={e.id}
                                    onClick={() => {
                                        setSelectedExercise(e)
                                        setPickerOpen(false)
                                        setSearch('')
                                    }}
                                    className="flex w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                                >
                                    {e.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="flex-1 w-full min-h-[180px]">
                {selectedExercise && (
                    <>
                        {isLoading && (
                            <div className="w-full h-full flex items-center justify-center">
                                <p className="text-muted-foreground text-sm">Loading...</p>
                            </div>
                        )}
                        {!isLoading && data.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center">
                                <p className="text-muted-foreground text-sm">No data for this period</p>
                            </div>
                        )}
                        {!isLoading && data.length > 0 && (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10, fill: '#888' }}
                                        tickFormatter={(d) => {
                                            const date = new Date(d)
                                            return `${date.getMonth() + 1}/${date.getDate()}`
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#888' }}
                                        tickFormatter={(v) => `${v}kg`}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="estimatedOneRM"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}