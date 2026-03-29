import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import { useVolumeStats } from '@/hooks/useWorkout'

interface Props {
    period: string
}

// Component to display the volume chart

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow">
            <p className="font-medium">{payload[0].payload.name}</p>
            <p className="text-muted-foreground">{payload[0].payload.date}</p>
            <p className="text-primary font-semibold">{payload[0].value.toLocaleString()} kg</p>
        </div>
    )
}

export default function VolumeChart({ period }: Props) {
    const { data = [], isLoading } = useVolumeStats(period)

    if (isLoading) return (
        <div className="w-full h-full flex items-center justify-center min-h-[180px]">
            <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
    )

    if (data.length === 0) return (
        <div className="w-full h-full flex items-center justify-center min-h-[180px]">
            <p className="text-muted-foreground text-sm">No data for this period</p>
        </div>
    )

    return (
        <div className="w-full h-full min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                        {data.map((_: any, index: number) => (
                            <Cell
                                key={index}
                                fill={index === data.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.5)'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}