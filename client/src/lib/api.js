import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL
const baseURL = apiUrl ? `${apiUrl.replace(/\/$/, '')}/api` : '/api'

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

export async function fetchMe(token) {
  const { data } = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export default api
