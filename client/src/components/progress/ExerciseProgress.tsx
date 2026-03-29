import { useState } from 'react'
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Area,
    AreaChart,
} from 'recharts'
import { useExerciseStats, useExercises } from '@/hooks/useWorkout'
import { useTrackedExercises } from '@/hooks/useTrackedExercises'
import { Plus, Pencil, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface Props {
    period: string
}

// Component to display exercises progress

// --- Sparkline ---
function Sparkline({ data }: { data: any[] }) {
    if (!data || data.length === 0) return (
        <div className="flex h-16 items-center justify-center">
            <p className="text-xs text-muted-foreground">No data</p>
        </div>
    )

    return (
        <ResponsiveContainer width="100%" height={64}>
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="estimatedOneRM"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#sparkGrad)"
                    dot={false}
                    activeDot={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

// --- Full chart tooltip ---
const FullTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow">
            <p className="text-muted-foreground text-xs">{d.date}</p>
            <p className="text-primary font-bold">{d.estimatedOneRM} kg e1RM</p>
            <p className="text-xs text-muted-foreground">
                {d.bestWeight}kg × {d.bestReps} reps
            </p>
            <p className="text-xs text-muted-foreground">
                Vol: {d.volume.toLocaleString()} kg
            </p>
        </div>
    )
}

// --- Exercise card ---
function ExerciseCard({
    slot,
    index,
    period,
    onEdit,
}: {
    slot: { id: string; name: string } | null
    index: number
    period: string
    onEdit: (index: number) => void
}) {
    const { data = [], isLoading } = useExerciseStats(slot?.id ?? null, period)
    const [expanded, setExpanded] = useState(false)

    const values = data.map((d: any) => d.estimatedOneRM ?? 0).filter(Boolean)
    const latest = values[values.length - 1] ?? null
    const first = values[0] ?? null
    const trend = latest !== null && first !== null ? latest - first : null
    const bestEver = values.length > 0 ? Math.max(...values) : null

    const TrendIcon = trend === null ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
    const trendColor = trend === null ? '' : trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'

    // Empty slot
    if (!slot) {
        return (
            <button
                onClick={() => onEdit(index)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/50 p-6 transition-colors hover:bg-accent hover:border-primary/50 min-h-[160px]"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Plus size={20} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Track exercise</p>
            </button>
        )
    }

    return (
        <>
            <div
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setExpanded(true)}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{slot.name}</p>
                        {latest !== null && (
                            <p className="text-xs text-muted-foreground">
                                e1RM: <span className="text-primary font-semibold">{latest} kg</span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(index) }}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Pencil size={14} />
                    </button>
                </div>

                {/* Sparkline */}
                {isLoading ? (
                    <div className="h-16 flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">Loading...</p>
                    </div>
                ) : (
                    <Sparkline data={data} />
                )}

                {/* Footer stats */}
                <div className="flex items-center justify-between">
                    {trend !== null && TrendIcon && (
                        <div className={`flex items-center gap-1 ${trendColor}`}>
                            <TrendIcon size={13} />
                            <span className="text-xs font-medium">
                                {trend > 0 ? '+' : ''}{trend} kg
                            </span>
                        </div>
                    )}
                    {bestEver !== null && (
                        <p className="text-xs text-muted-foreground ml-auto">
                            Best: <span className="font-medium text-foreground">{bestEver} kg</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Expanded dialog */}
            <Dialog open={expanded} onOpenChange={setExpanded}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{slot.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        {/* Key stats */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center gap-0.5 rounded-xl bg-muted/50 p-3">
                                <span className="text-base font-bold text-primary">
                                    {latest ?? '-'}
                                </span>
                                <span className="text-xs text-muted-foreground text-center">Current e1RM</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 rounded-xl bg-muted/50 p-3">
                                <span className="text-base font-bold">{bestEver ?? '-'}</span>
                                <span className="text-xs text-muted-foreground text-center">Best e1RM</span>
                            </div>
                            <div className={`flex flex-col items-center gap-0.5 rounded-xl bg-muted/50 p-3 ${trendColor}`}>
                                <span className="text-base font-bold">
                                    {trend !== null ? `${trend > 0 ? '+' : ''}${trend}` : '-'}
                                </span>
                                <span className="text-xs text-muted-foreground text-center">Period Δ</span>
                            </div>
                        </div>

                        {/* Full chart */}
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
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
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip content={<FullTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="estimatedOneRM"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2.5}
                                        dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center">
                                <p className="text-muted-foreground text-sm">No data for this period</p>
                            </div>
                        )}

                        {/* Session history */}
                        {data.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                                    Sessions
                                </p>
                                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                                    {[...data].reverse().map((d: any, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40"
                                        >
                                            <span className="text-xs text-muted-foreground">{d.date}</span>
                                            <span className="text-xs font-medium">
                                                {d.bestWeight}kg × {d.bestReps} reps
                                            </span>
                                            <span className="text-xs text-primary font-semibold">
                                                {d.estimatedOneRM}kg
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

// --- Exercise picker dialog ---
function ExercisePicker({
    open,
    onClose,
    onSelect,
}: {
    open: boolean
    onClose: () => void
    onSelect: (exercise: { id: string; name: string } | null) => void
}) {
    const [search, setSearch] = useState('')
    const { data: exercises = [] } = useExercises()

    const filtered = exercises
        .filter((e: any) =>
            e.type === 'WEIGHTED' &&
            e.name.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 10)

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Choose Exercise</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    />
                    <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                        {filtered.map((e: any) => (
                            <button
                                key={e.id}
                                onClick={() => { onSelect({ id: e.id, name: e.name }); onClose() }}
                                className="flex w-full items-center px-3 py-2.5 rounded-lg text-left text-sm hover:bg-accent transition-colors"
                            >
                                {e.name}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => { onSelect(null); onClose() }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <X size={14} />
                        Remove this slot
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// --- Main component ---
export default function ExerciseProgress({ period }: Props) {
    const { tracked, setSlot } = useTrackedExercises()
    const [editingSlot, setEditingSlot] = useState<number | null>(null)

    return (
        <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
                Tap a card to see full details · tap ✏️ to change exercise
            </p>

            <div className="flex flex-col gap-3">
                {tracked.map((slot, index) => (
                    <ExerciseCard
                        key={index}
                        slot={slot}
                        index={index}
                        period={period}
                        onEdit={setEditingSlot}
                    />
                ))}
            </div>

            <ExercisePicker
                open={editingSlot !== null}
                onClose={() => setEditingSlot(null)}
                onSelect={(exercise) => {
                    if (editingSlot !== null) setSlot(editingSlot, exercise)
                }}
            />
        </div>
    )
}