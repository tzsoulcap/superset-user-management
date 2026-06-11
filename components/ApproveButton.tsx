'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useApprove } from '@/hooks/useApprove'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CheckCircle } from 'lucide-react'

interface ApproveButtonProps {
  id: number
  username: string
}

export function ApproveButton({ id, username }: ApproveButtonProps) {
  const approve = useApprove()
  const [pending, setPending] = useState(false)

  const handleApprove = async () => {
    if (pending) return
    setPending(true)
    try {
      await approve.mutateAsync(id)
      toast.success(`Approved "${username}" successfully`, {
        description: 'The user can now log in to Superset.',
        icon: '✅',
      })
    } catch (err: unknown) {
      toast.error('Failed to approve user', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      id={`approve-btn-${id}`}
      onClick={handleApprove}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/20 hover:text-emerald-300 hover:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <LoadingSpinner size="sm" className="text-emerald-400" />
      ) : (
        <CheckCircle className="h-3.5 w-3.5" />
      )}
      <span>Approve</span>
    </button>
  )
}
