import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, AuthContext } from '@/context/AuthContext'
import { useContext } from 'react'

// Mock the axios module
vi.mock('@/api/axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}))

import api from '@/api/axios'

const mockedApi = vi.mocked(api)

// Helper component that exposes auth context values for testing
function AuthConsumer({ onRender }: { onRender: (ctx: any) => void }) {
    const ctx = useContext(AuthContext)
    onRender(ctx)
    return (
        <div>
            {ctx?.loading && <span>loading</span>}
            {ctx?.user && <span>user:{ctx.user.email}</span>}
            {!ctx?.loading && !ctx?.user && <span>no-user</span>}
        </div>
    )
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show loading state initially', async () => {
        // Make the API call hang so we can observe the loading state
        mockedApi.get.mockReturnValue(new Promise(() => {}))

        let captured: any
        render(
            <AuthProvider>
                <AuthConsumer onRender={(ctx) => (captured = ctx)} />
            </AuthProvider>
        )

        expect(screen.getByText('loading')).toBeInTheDocument()
        expect(captured.loading).toBe(true)
        expect(captured.user).toBeNull()
    })

    it('should set user when /auth/me succeeds', async () => {
        mockedApi.get.mockResolvedValue({
            data: { user: { id: 'u1', email: 'test@test.com' } },
        })

        render(
            <AuthProvider>
                <AuthConsumer onRender={() => {}} />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('user:test@test.com')).toBeInTheDocument()
        })

        expect(mockedApi.get).toHaveBeenCalledWith('/auth/me')
    })

    it('should set user to null when /auth/me fails', async () => {
        mockedApi.get.mockRejectedValue(new Error('Unauthorized'))

        render(
            <AuthProvider>
                <AuthConsumer onRender={() => {}} />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('no-user')).toBeInTheDocument()
        })
    })

    it('login() should call API and update user', async () => {
        mockedApi.get.mockRejectedValue(new Error('Unauthorized'))
        mockedApi.post.mockResolvedValue({
            data: { user: { id: 'u1', email: 'logged@test.com' } },
        })

        let captured: any
        render(
            <AuthProvider>
                <AuthConsumer onRender={(ctx) => (captured = ctx)} />
            </AuthProvider>
        )

        // Wait for initial load to complete
        await waitFor(() => expect(captured.loading).toBe(false))

        await act(async () => {
            await captured.login('logged@test.com', 'pass')
        })

        expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
            email: 'logged@test.com',
            password: 'pass',
        })
        expect(captured.user).toEqual({ id: 'u1', email: 'logged@test.com' })
    })

    it('register() should call API and set user', async () => {
        mockedApi.get.mockRejectedValue(new Error('Unauthorized'))
        mockedApi.post.mockResolvedValue({
            data: { user: { id: 'u2', email: 'new@test.com' } },
        })

        let captured: any
        render(
            <AuthProvider>
                <AuthConsumer onRender={(ctx) => (captured = ctx)} />
            </AuthProvider>
        )

        await waitFor(() => expect(captured.loading).toBe(false))

        await act(async () => {
            await captured.register('new@test.com', 'pass')
        })

        expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
            email: 'new@test.com',
            password: 'pass',
        })
        expect(captured.user).toEqual({ id: 'u2', email: 'new@test.com' })
    })

    it('logout() should call API and clear user', async () => {
        mockedApi.get.mockResolvedValue({
            data: { user: { id: 'u1', email: 'test@test.com' } },
        })
        mockedApi.post.mockResolvedValue({})

        let captured: any
        render(
            <AuthProvider>
                <AuthConsumer onRender={(ctx) => (captured = ctx)} />
            </AuthProvider>
        )

        await waitFor(() => expect(captured.user).not.toBeNull())

        await act(async () => {
            await captured.logout()
        })

        expect(mockedApi.post).toHaveBeenCalledWith('/auth/logout')
        expect(captured.user).toBeNull()
    })
})
