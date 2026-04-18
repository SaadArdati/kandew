import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL
const baseURL = apiUrl ? `${apiUrl}/api` : '/api'

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Request failed'
    const normalized = new Error(message)
    normalized.response = error.response
    normalized.status = error.response?.status
    return Promise.reject(normalized)
  }
)

export async function fetchMe(token) {
  const { data } = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export default api
