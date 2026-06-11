'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useDelete } from '@/hooks/useDelete'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  id: number
  username: string
}

export function DeleteButton({ id, username }: DeleteButtonProps) {
  const deleteReg = useDelete()
  const [pending, setPending] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    setPending(true)
    setOpen(false)
    try {
      await deleteReg.mutateAsync(id)
      toast.success(`Deleted registration for "${username}"`, {
        description: 'The registration has been removed.',
        icon: '🗑️',
      })
    } catch (err: unknown) {
      toast.error('Failed to delete registration', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(o: boolean) => setOpen(o)}>
      <AlertDialogTrigger
        id={`delete-btn-${id}`}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 ring-1 ring-red-500/30 transition-all hover:bg-red-500/20 hover:text-red-300 hover:ring-red-400/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <LoadingSpinner size="sm" className="text-red-400" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        <span>Delete</span>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-zinc-800 bg-zinc-900 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete registration?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            This will permanently delete the registration request for{' '}
            <span className="font-semibold text-zinc-200">{username}</span>. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            id={`confirm-delete-btn-${id}`}
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
