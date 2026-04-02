import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// We need to test the interceptor behavior, so we import the configured instance
// and mock the underlying axios methods

// Mock axios.create to return a controllable instance
// We need to intercept at a lower level to test the interceptor logic

describe('Axios interceptor', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset the module so each test gets a fresh interceptor state
        vi.resetModules()
    })

    it('should retry a request after successful token refresh', async () => {
        // Mock axios.post for refresh
        const axiosPostSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} })

        // Dynamically import to get a fresh module with interceptors
        const { default: api } = await import('@/api/axios')

        // First call fails with 401, second call succeeds
        const mockAdapter = vi.fn()
            .mockRejectedValueOnce({
                config: { url: '/workouts', _retry: false },
                response: { status: 401 },
            })
            .mockResolvedValueOnce({ data: { workouts: [] }, status: 200 })

        api.defaults.adapter = mockAdapter as any

        const res = await api.get('/workouts')

        expect(axiosPostSpy).toHaveBeenCalledWith(
            '/auth/refresh',
            {},
            { withCredentials: true }
        )
        expect(res.data.workouts).toEqual([])

        axiosPostSpy.mockRestore()
    })

    it('should not retry auth endpoints', async () => {
        const axiosPostSpy = vi.spyOn(axios, 'post')

        const { default: api } = await import('@/api/axios')

        const mockAdapter = vi.fn().mockRejectedValue({
            config: { url: '/auth/login' },
            response: { status: 401 },
        })

        api.defaults.adapter = mockAdapter as any

        await expect(api.post('/auth/login', {})).rejects.toBeDefined()

        // Should NOT have called refresh
        expect(axiosPostSpy).not.toHaveBeenCalledWith(
            '/auth/refresh',
            expect.anything(),
            expect.anything()
        )

        axiosPostSpy.mockRestore()
    })

    it('should only fire one refresh when multiple 401s happen concurrently', async () => {
        const axiosPostSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} })

        const { default: api } = await import('@/api/axios')

        let callCount = 0
        const mockAdapter = vi.fn().mockImplementation(async (config: any) => {
            callCount++
            if (callCount <= 2) {
                // First 2 calls fail with 401
                throw {
                    config: { ...config, _retry: false },
                    response: { status: 401 },
                }
            }
            // Subsequent retries succeed
            return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }
        })

        api.defaults.adapter = mockAdapter as any

        // Fire 2 concurrent requests that both get 401
        const [res1, res2] = await Promise.all([
            api.get('/workouts'),
            api.get('/exercises'),
        ])

        // Only ONE refresh request should have been made
        expect(axiosPostSpy).toHaveBeenCalledTimes(1)
        expect(res1.data.ok).toBe(true)
        expect(res2.data.ok).toBe(true)

        axiosPostSpy.mockRestore()
    })
})
