import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext } from '@/context/AuthContext'
import LoginPage from '@/pages/LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

function renderLoginPage(user: any = null) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })

    const mockAuth = {
        user,
        loading: false,
        login: mockLogin,
        register: vi.fn(),
        logout: vi.fn(),
    }

    return render(
        <QueryClientProvider client={queryClient}>
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter initialEntries={['/login']}>
                    <LoginPage />
                </MemoryRouter>
            </AuthContext.Provider>
        </QueryClientProvider>
    )
}

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render email and password fields', () => {
        renderLoginPage()

        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    })

    it('should call login on form submit', async () => {
        mockLogin.mockResolvedValue(undefined)
        renderLoginPage()

        const user = userEvent.setup()
        await user.type(screen.getByLabelText('Email'), 'test@test.com')
        await user.type(screen.getByLabelText('Password'), 'password123')
        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123')
        })
    })

    it('should display error message on failed login', async () => {
        mockLogin.mockRejectedValue({
            response: { data: { error: 'Invalid credentials' } },
        })
        renderLoginPage()

        const user = userEvent.setup()
        await user.type(screen.getByLabelText('Email'), 'test@test.com')
        await user.type(screen.getByLabelText('Password'), 'wrong')
        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
        })
    })

    it('should show "Signing in..." while loading', async () => {
        // Make login hang so we can see the loading state
        mockLogin.mockReturnValue(new Promise(() => {}))
        renderLoginPage()

        const user = userEvent.setup()
        await user.type(screen.getByLabelText('Email'), 'test@test.com')
        await user.type(screen.getByLabelText('Password'), 'password123')
        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        await waitFor(() => {
            expect(screen.getByText('Signing in...')).toBeInTheDocument()
        })
    })

    it('should have a link to the register page', () => {
        renderLoginPage()

        expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register')
    })
})
