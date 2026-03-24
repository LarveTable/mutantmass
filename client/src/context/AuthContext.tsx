import { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api from '../api/axios'

// Every component can use this context to get the current user and to login, register or logout

interface User {
    id: string
    email: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

// Will be called by app.tsx to wrap the entire app
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // On app load, check if we have a valid session
    useEffect(() => {
        api.get('/auth/me')
            .then((res) => setUser(res.data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password })
        setUser(res.data.user)
    }

    const register = async (email: string, password: string) => {
        const res = await api.post('/auth/register', { email, password })
        setUser(res.data.user)
    }

    const logout = async () => {
        await api.post('/auth/logout')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}