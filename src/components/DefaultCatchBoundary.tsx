import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'

export interface DefaultCatchBoundaryProps {
  error: Error
}

export function DefaultCatchBoundary({ error }: DefaultCatchBoundaryProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Something went wrong</h1>
      <div className="mt-4">
        <p className="text-base">We encountered an unexpected error.</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
      <div className="mt-6">
        <button
          onClick={() => navigate({ to: '/' })}
          className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Go back home
        </button>
      </div>
    </div>
  )
} 