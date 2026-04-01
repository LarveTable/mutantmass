import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMuscleStats, useTargetMuscleStats } from '@/hooks/useWorkout'
import api from '@/api/axios'
import React from 'react'

vi.mock('@/api/axios', () => ({
    default: {
        get: vi.fn(),
    }
}))

const createTestQueryClient = () => new QueryClient({
    defaultOptions: { queries: { retry: false } }
})

export function createWrapper() {
    const testQueryClient = createTestQueryClient()
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={testQueryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useWorkout Stats Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('useMuscleStats fetches standard muscles correctly without target param', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({ data: { data: { CHEST: { volume: 500 } } } })
        
        const { result } = renderHook(() => useMuscleStats('month'), {
            wrapper: createWrapper()
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        
        expect(api.get).toHaveBeenCalledWith('/stats/muscles?period=month')
        expect(result.current.data).toEqual({ CHEST: { volume: 500 } })
    })

    it('useTargetMuscleStats forcefully requests data with target=true parameter for heatmap precision', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({ data: { data: { 'upper-back': { volume: 1000 } } } })
        
        const { result } = renderHook(() => useTargetMuscleStats('week'), {
            wrapper: createWrapper()
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        
        // Assert the proper parameters were securely appended
        expect(api.get).toHaveBeenCalledWith('/stats/muscles?period=week&target=true')
        expect(result.current.data).toEqual({ 'upper-back': { volume: 1000 } })
    })
})
