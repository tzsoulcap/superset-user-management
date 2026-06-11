'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { RegistrationsTable } from '@/components/RegistrationsTable'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Shield, LogOut, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const { isAuthenticated, logout, refreshCsrf, supersetUrl } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <LoadingSpinner size="lg" className="text-violet-500" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Superset Admin</span>
              <span className="ml-2 text-xs text-zinc-500">User Registrations</span>
            </div>
            {/* Connected server badge */}
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-mono text-emerald-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {supersetUrl}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-csrf-btn"
              onClick={refreshCsrf}
              title="Refresh CSRF token"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh Token</span>
            </button>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Registration Requests</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Review and approve or reject pending Superset account registrations.
          </p>
        </div>

        <RegistrationsTable />
      </main>
    </div>
  )
}
