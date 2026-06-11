'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { REGISTRATIONS_QUERY_KEY } from './useRegistrations'

export function useDelete() {
  const { token, csrfToken, supersetUrl, refreshCsrf } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const doDelete = async (csrf: string) => {
        const res = await fetch(`/api/superset/security/user_registrations/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-CSRFToken': csrf,
            'X-Superset-URL': supersetUrl,
          },
        })
        return res
      }

      let res = await doDelete(csrfToken || '')

      // CSRF expired — refresh and retry once
      if (res.status === 400) {
        const newCsrf = await refreshCsrf()
        res = await doDelete(newCsrf)
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Delete failed: ${res.status}`)
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REGISTRATIONS_QUERY_KEY, supersetUrl] })
    },
  })
}
