'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { REGISTRATIONS_QUERY_KEY } from './useRegistrations'

export function useApprove() {
  const { token, csrfToken, supersetUrl, refreshCsrf } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const doApprove = async (csrf: string) => {
        const res = await fetch('/api/superset/custom/approve_user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-CSRFToken': csrf,
            'X-Superset-URL': supersetUrl,
          },
          body: JSON.stringify({ id }),
        })
        return res
      }

      let res = await doApprove(csrfToken || '')

      // CSRF expired — refresh and retry once
      if (res.status === 400) {
        const newCsrf = await refreshCsrf()
        res = await doApprove(newCsrf)
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Approve failed: ${res.status}`)
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REGISTRATIONS_QUERY_KEY, supersetUrl] })
    },
  })
}
