import { createContext, useContext, useState, type ReactNode } from 'react'

export interface User {
  id: string
  username: string
  displayName: string
  role: 'user' | 'admin'
}

export interface Artwork {
  id: string
  userId: string
  username: string
  templateId: string
  templateName: string
  colors: Record<string, string>
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  fishName?: string
}

interface AppContextValue {
  user: User | null
  artworks: Artwork[]
  login: (username: string, password: string) => { ok: boolean; error?: string }
  register: (username: string, displayName: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  submitArtwork: (artwork: Omit<Artwork, 'id' | 'userId' | 'username' | 'createdAt' | 'status'>) => void
  approveArtwork: (id: string) => void
  rejectArtwork: (id: string) => void
  restoreArtwork: (id: string) => void
  deleteArtwork: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const DEMO_USERS: User[] = [
  { id: '1', username: 'admin', displayName: 'Quản trị viên', role: 'admin' },
  { id: '2', username: 'bao', displayName: 'Bảo Ngư', role: 'user' },
]

const DEMO_ARTWORKS: Artwork[] = [
  {
    id: 'art1',
    userId: '2',
    username: 'bao',
    templateId: 'clownfish',
    templateName: 'Cá Hề',
    colors: {
      body: '#FF8C42', tail_upper: '#FF4500', tail_lower: '#FF4500', tail_mid: '#FF4500',
      dorsal_fin: '#FF8C42', pectoral_fin: '#FF8C42', anal_fin: '#FF8C42',
      stripe1: '#FFFFFF', stripe2: '#FFFFFF',
      eye_white: '#FFFFFF', eye_pupil: '#000000',
    },
    status: 'approved',
    createdAt: '2026-08-01T10:00:00Z',
    fishName: 'Nemo',
  },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(DEMO_USERS)
  const [artworks, setArtworks] = useState<Artwork[]>(DEMO_ARTWORKS)
  const [passwords] = useState<Record<string, string>>({ admin: 'admin123', bao: '123456' })
  const [allPasswords, setAllPasswords] = useState<Record<string, string>>(passwords)

  const login = (username: string, password: string) => {
    const found = users.find((u) => u.username === username)
    if (!found) return { ok: false, error: 'Tài khoản không tồn tại' }
    if (allPasswords[username] !== password) return { ok: false, error: 'Mật khẩu không đúng' }
    setUser(found)
    return { ok: true }
  }

  const register = (username: string, displayName: string, password: string) => {
    if (users.find((u) => u.username === username)) {
      return { ok: false, error: 'Tên tài khoản đã tồn tại' }
    }
    const newUser: User = {
      id: String(Date.now()),
      username,
      displayName,
      role: 'user',
    }
    setUsers((prev) => [...prev, newUser])
    setAllPasswords((prev) => ({ ...prev, [username]: password }))
    setUser(newUser)
    return { ok: true }
  }

  const logout = () => setUser(null)

  const submitArtwork = (artwork: Omit<Artwork, 'id' | 'userId' | 'username' | 'createdAt' | 'status'>) => {
    if (!user) return
    const newArtwork: Artwork = {
      ...artwork,
      id: String(Date.now()),
      userId: user.id,
      username: user.displayName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    setArtworks((prev) => [...prev, newArtwork])
  }

  const approveArtwork = (id: string) =>
    setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)))

  const rejectArtwork = (id: string) =>
    setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a)))

  const restoreArtwork = (id: string) =>
    setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'pending' } : a)))

  const deleteArtwork = (id: string) =>
    setArtworks((prev) => prev.filter((a) => a.id !== id))

  return (
    <AppContext.Provider
      value={{ user, artworks, login, register, logout, submitArtwork, approveArtwork, rejectArtwork, restoreArtwork, deleteArtwork }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
