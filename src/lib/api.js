import axios from 'axios'

// На телефоне window.location.hostname = IP компьютера (172.20.10.x),
// поэтому используем его вместо localhost
const getBaseURL = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000/api'
  const host = window.location.hostname
  return host === 'localhost' ? 'http://localhost:5000/api' : `http://${host}:5000/api`
}

const api = axios.create({
  baseURL: getBaseURL(),
})

// Автоматически добавляет токен в каждый запрос
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api