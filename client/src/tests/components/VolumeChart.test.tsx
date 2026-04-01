import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import VolumeChart from '@/components/progress/VolumeChart'
import { useVolumeStats } from '@/hooks/useWorkout'
import userEvent from '@testing-library/user-event'

// Mock the Recharts library (since ResizeObserver and SVG layout don't play well in jsdom edge cases)
vi.mock('recharts', async () => {
    const ActualRecharts = await vi.importActual('recharts')
    return {
        ...ActualRecharts,
        ResponsiveContainer: ({ children }: any) => (
            <div data-testid="responsive-container" style={{ width: 800, height: 600 }}>
                {children}
            </div>
        )
    }
})

// Mock the specific hook
vi.mock('@/hooks/useWorkout', () => ({
    useVolumeStats: vi.fn()
}))

describe('VolumeChart', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders loading state when data is loading', () => {
        vi.mocked(useVolumeStats).mockReturnValue({ data: [], isLoading: true } as any)
        
        render(<VolumeChart period="month" />)
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders empty state when data is completely empty', () => {
        vi.mocked(useVolumeStats).mockReturnValue({ data: [], isLoading: false } as any)
        
        render(<VolumeChart period="month" />)
        expect(screen.getByText('No data for this period')).toBeInTheDocument()
    })

    it('renders the chart correctly when data is provided and switches modes', async () => {
        const mockData = [
            {
                weekStart: '2026-04-06',
                total: 2500,
                byMuscle: { CHEST: 1250, BACK: 1250 },
                rollingAvg: 2000
            }
        ]

        vi.mocked(useVolumeStats).mockReturnValue({ data: mockData, isLoading: false } as any)
        
        const user = userEvent.setup()
        render(<VolumeChart period="month" />)
        
        // Wait for responsive container to render the mock recharts frame
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument()

        // Default mode is 'By Muscle' -> Muscle legend should appear explicitly for filled data
        // "chest" should be visible from our MUSCLES list transformation
        expect(screen.getByText('chest')).toBeInTheDocument()
        expect(screen.getByText('back')).toBeInTheDocument()
        
        // Switch to "Total" view
        const totalBtn = screen.getByText('Total')
        await user.click(totalBtn)
        
        // The toggled button should now look active
        expect(totalBtn).toHaveClass('bg-card', 'text-foreground')
        // And the muscle specific legends will hide
        expect(screen.queryByText('chest')).not.toBeInTheDocument()
    })
})
