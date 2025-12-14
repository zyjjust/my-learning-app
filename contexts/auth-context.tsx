"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  username: string
  name: string
  email?: string
  level: number
  current_xp: number
  gold_coins: number
  streak: number
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      // 从 localStorage 加载用户信息
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 获取初始用户信息
    refreshUser()
  }, [])

  const signOut = async () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser))
    } else {
      localStorage.removeItem("user")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

