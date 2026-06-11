'use client'

import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import { useRegistrations } from '@/hooks/useRegistrations'
import { ApproveButton } from '@/components/ApproveButton'
import { DeleteButton } from '@/components/DeleteButton'
import { PageLoader } from '@/components/LoadingSpinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, RefreshCw, UserX } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { REGISTRATIONS_QUERY_KEY } from '@/hooks/useRegistrations'

/**
 * Superset stores registration_date in UTC+0 without timezone suffix.
 * Appending 'Z' forces JavaScript to parse it as UTC so all calculations
 * (relative time, tooltip) correctly reflect UTC+7 (Asia/Bangkok).
 */
function parseUtcDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN)
  const hasTimezone = /[Zz]$/.test(dateStr) || /[+-]\d{2}:?\d{2}$/.test(dateStr)
  return new Date(hasTimezone ? dateStr : dateStr + 'Z')
}

const BANGKOK_LOCALE = 'th-TH'
const BANGKOK_TZ = 'Asia/Bangkok'

export function RegistrationsTable() {
  const { data: registrations, isLoading, isError, error, isFetching } = useRegistrations()
  const queryClient = useQueryClient()

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: REGISTRATIONS_QUERY_KEY })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Pending Registrations</h2>
          {!isLoading && registrations && (
            <Badge
              variant="secondary"
              className="bg-violet-500/20 text-violet-300 border-violet-500/30"
            >
              {registrations.length}
            </Badge>
          )}
        </div>
        <button
          id="refresh-registrations-btn"
          onClick={handleManualRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-red-400">Failed to load registrations</p>
              <p className="mt-1 text-xs text-zinc-500">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
            <button
              id="retry-registrations-btn"
              onClick={handleManualRefresh}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-all hover:bg-zinc-700 hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : !registrations || registrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
              <UserX className="h-8 w-8 text-zinc-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-zinc-300">No pending registrations</p>
              <p className="mt-1 text-sm text-zinc-500">
                All registration requests have been processed.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium">Name</TableHead>
                <TableHead className="text-zinc-400 font-medium">Username</TableHead>
                <TableHead className="text-zinc-400 font-medium">Email</TableHead>
                <TableHead className="text-zinc-400 font-medium">Registered</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow
                  key={reg.id}
                  className="border-zinc-800 transition-colors hover:bg-zinc-800/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Avatar initials */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                        {(reg.first_name?.[0] ?? reg.username?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {reg.first_name} {reg.last_name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-300">
                      {reg.username}
                    </code>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${reg.email}`}
                      className="text-sm text-zinc-300 hover:text-violet-400 transition-colors"
                    >
                      {reg.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-sm text-zinc-400"
                      title={parseUtcDate(reg.registration_date).toLocaleString(
                        BANGKOK_LOCALE,
                        { timeZone: BANGKOK_TZ, dateStyle: 'medium', timeStyle: 'short' }
                      )}
                    >
                      {formatDistanceToNow(parseUtcDate(reg.registration_date), {
                        addSuffix: true,
                        locale: th,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <ApproveButton id={reg.id} username={reg.username} />
                      <DeleteButton id={reg.id} username={reg.username} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Auto-refresh notice */}
      {!isLoading && !isError && (
        <p className="text-right text-xs text-zinc-600">
          Auto-refreshes every 30 seconds
        </p>
      )}
    </div>
  )
}
