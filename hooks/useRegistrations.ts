'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { UserRegistration } from '@/types'

export const REGISTRATIONS_QUERY_KEY = ['user-registrations']

export function useRegistrations() {
  const { token, csrfToken, supersetUrl } = useAuth()

  return useQuery<UserRegistration[]>({
    queryKey: [...REGISTRATIONS_QUERY_KEY, supersetUrl],
    queryFn: async () => {
      const res = await fetch('/api/superset/security/user_registrations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-CSRFToken': csrfToken || '',
          'X-Superset-URL': supersetUrl,
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch registrations: ${res.status}`)
      }

      const data = await res.json()
      // Superset returns { result: [...] }
      return data.result ?? data ?? []
    },
    enabled: !!token,
    refetchInterval: 30_000,
    staleTime: 10_000,
  })
}
