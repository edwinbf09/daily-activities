"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay usuario guardado
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        return { success: true }
      } else {
        return { success: false, message: data.error || "Error de inicio de sesión" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        return { success: true }
      } else {
        return { success: false, message: data.error || "Error al crear cuenta" }
      }
    } catch (error) {
      console.error("Register error:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  const requestPasswordReset = async (email: string) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      return {
        success: response.ok,
        message: data.message || (response.ok ? "Email enviado" : "Error al enviar email"),
      }
    } catch (error) {
      console.error("Password reset error:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()
      return {
        success: response.ok,
        message: data.message || (response.ok ? "Contraseña actualizada" : "Error al actualizar contraseña"),
      }
    } catch (error) {
      console.error("Password reset confirm error:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, requestPasswordReset, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
