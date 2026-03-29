import { useState } from 'react'
import {
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Line,
    ComposedChart,
} from 'recharts'
import { useVolumeStats } from '@/hooks/useWorkout'

interface Props {
    period: string
}

const MUSCLE_COLORS: Record<string, string> = {
    CHEST: '#ef4444',
    BACK: '#3b82f6',
    SHOULDERS: '#a855f7',
    BICEPS: '#f97316',
    TRICEPS: '#eab308',
    FOREARMS: '#84cc16',
    LEGS: '#06b6d4',
    GLUTES: '#ec4899',
    CORE: '#14b8a6',
    CARDIO: '#64748b',
    FULL_BODY: '#8b5cf6',
}

const MUSCLES = Object.keys(MUSCLE_COLORS)

const CustomTooltip = ({ active, payload, mode }: any) => {
    if (!active || !payload?.length) return null
    const week = payload[0].payload

    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow max-w-[200px]">
            <p className="font-medium mb-1">Week of {week.weekStart}</p>
            <p className="text-primary font-semibold">
                {week.total.toLocaleString()} kg total
            </p>
            <p className="text-muted-foreground text-xs mb-1">
                ~{(week.total / 1000).toFixed(1)}t · avg {(week.rollingAvg / 1000).toFixed(1)}t
            </p>
            {mode === 'muscle' && (
                <div className="flex flex-col gap-0.5 mt-1 border-t border-border pt-1">
                    {MUSCLES.filter(m => week.byMuscle?.[m] > 0).map(m => (
                        <div key={m} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full" style={{ background: MUSCLE_COLORS[m] }} />
                                <span className="text-xs text-muted-foreground capitalize">
                                    {m.toLowerCase().replace('_', ' ')}
                                </span>
                            </div>
                            <span className="text-xs font-medium">
                                {week.byMuscle[m].toLocaleString()} kg
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function VolumeChart({ period }: Props) {
    const { data = [], isLoading } = useVolumeStats(period)
    const [mode, setMode] = useState<'total' | 'muscle'>('muscle')

    if (isLoading) return (
        <div className="h-full min-h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
    )

    if (data.length === 0) return (
        <div className="h-full min-h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No data for this period</p>
        </div>
    )

    return (
        <div className="flex flex-col gap-3 h-full">
            {/* Toggle */}
            <div className="flex rounded-lg border border-border bg-muted p-0.5 gap-0.5 self-end shrink-0">
                <button
                    onClick={() => setMode('total')}
                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${mode === 'total'
                        ? 'bg-card text-foreground shadow'
                        : 'text-muted-foreground'
                        }`}
                >
                    Total
                </button>
                <button
                    onClick={() => setMode('muscle')}
                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${mode === 'muscle'
                        ? 'bg-card text-foreground shadow'
                        : 'text-muted-foreground'
                        }`}
                >
                    By Muscle
                </button>
            </div>

            {/* Chart */}
            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="weekStart"
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
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip mode={mode} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />

                        {mode === 'total' ? (
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                {data.map((_: any, index: number) => (
                                    <Cell
                                        key={index}
                                        fill={index === data.length - 1
                                            ? 'hsl(var(--primary))'
                                            : 'hsl(var(--primary) / 0.5)'}
                                    />
                                ))}
                            </Bar>
                        ) : (
                            MUSCLES.map(muscle => (
                                <Bar
                                    key={muscle}
                                    dataKey={`byMuscle.${muscle}`}
                                    stackId="muscles"
                                    fill={MUSCLE_COLORS[muscle]}
                                    radius={muscle === 'FULL_BODY' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                />
                            ))
                        )}

                        <Line
                            type="monotone"
                            dataKey="rollingAvg"
                            stroke="white"
                            strokeWidth={1.5}
                            strokeDasharray="4 2"
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Muscle legend (only in muscle mode) */}
            {mode === 'muscle' && (
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center shrink-0">
                    {MUSCLES.map(m => (
                        <div key={m} className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full" style={{ background: MUSCLE_COLORS[m] }} />
                            <span className="text-xs text-muted-foreground capitalize">
                                {m.toLowerCase().replace('_', ' ')}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}