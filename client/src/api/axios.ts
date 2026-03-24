import axios from 'axios'

// Axios instance used for every api calls, attaches cookies with request and handles token refresh

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true, // send cookies with every request
})

// Intercept 401s and try to refresh the token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                await axios.post(
                    'http://localhost:3000/auth/refresh',
                    {},
                    { withCredentials: true }
                )
                return api(originalRequest) // retry the original request
            } catch {
                window.location.href = '/login' // refresh failed, send to login
            }
        }

        return Promise.reject(error)
    }
)

export default api