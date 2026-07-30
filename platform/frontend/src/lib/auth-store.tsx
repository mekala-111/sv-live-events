import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, TOKEN_KEY } from './api'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN'
  phone?: string
}

interface AuthPayload {
  accessToken: string
  refreshToken?: string
  user: User
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

const USER_KEY = 'sv_user'

/** Local demo accounts used when the API is unreachable */
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@svliveevents.com': {
    password: 'Admin@123',
    user: {
      id: 'demo-admin',
      email: 'admin@svliveevents.com',
      name: 'SV Admin',
      role: 'ADMIN',
    },
  },
  'customer@svliveevents.com': {
    password: 'Customer@123',
    user: {
      id: 'demo-customer',
      email: 'customer@svliveevents.com',
      name: 'Demo Customer',
      role: 'CUSTOMER',
    },
  },
}

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function isNetworkError(err: unknown) {
  const e = err as { code?: string; message?: string; response?: unknown }
  return !e?.response && (e?.code === 'ERR_NETWORK' || e?.message === 'Network Error' || !e?.code)
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => loadStoredUser())
  const [isLoading] = useState(false)

  const persist = useCallback((accessToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(accessToken)
    setUser(nextUser)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    const demo = DEMO_USERS[normalized]

    try {
      const res = await api.post<ApiEnvelope<AuthPayload>>('/auth/login', {
        email: normalized,
        password,
      })
      const payload = res.data?.data
      if (!payload?.accessToken || !payload?.user) {
        throw new Error(res.data?.message || 'Invalid login response')
      }
      persist(payload.accessToken, payload.user)
      return payload.user
    } catch (err) {
      // ponytail: offline demo session so admin UI works when API is down
      if (demo && demo.password === password && isNetworkError(err)) {
        persist(`demo-token-${demo.user.id}`, demo.user)
        return demo.user
      }
      throw err
    }
  }, [persist])

  const register = useCallback(async (form: RegisterData) => {
    const res = await api.post<ApiEnvelope<AuthPayload>>('/auth/register', {
      ...form,
      email: form.email.trim().toLowerCase(),
    })
    const payload = res.data?.data
    if (!payload?.accessToken || !payload?.user) {
      throw new Error(res.data?.message || 'Invalid register response')
    }
    persist(payload.accessToken, payload.user)
    return payload.user
  }, [persist])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
