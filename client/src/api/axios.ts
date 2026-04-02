import axios from 'axios'

// Axios instance used for every api calls, attaches cookies with request and handles token refresh

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,
})

// Refresh lock: ensures only one refresh request is in-flight at a time.
// All concurrent 401s wait for the same refresh promise.
let refreshPromise: Promise<void> | null = null

// Intercept 401s and try to refresh the token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Do not intercept authentication-related requests to prevent infinite loops
        if (
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh')
        ) {
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // If a refresh is already in progress, wait for it instead of firing a new one
                if (!refreshPromise) {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
                    refreshPromise = axios.post(
                        `${baseUrl}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    ).then(() => { }).finally(() => {
                        refreshPromise = null
                    })
                }

                await refreshPromise
                return api(originalRequest) // retry the original request
            } catch {
                // Refresh failed, let the caller handle the 401 error
                return Promise.reject(error)
            }
        }

        return Promise.reject(error)
    }
)

export default api