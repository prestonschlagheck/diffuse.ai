'use client'

import { useState } from 'react'

interface UpgradeCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: string) => Promise<boolean>
  planName: string
  loading?: boolean
}

export default function UpgradeCodeModal({
  isOpen,
  onClose,
  onVerify,
  planName,
  loading = false,
}: UpgradeCodeModalProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setVerifying(true)

    try {
      const isValid = await onVerify(code.trim())
      if (!isValid) {
        setError('Invalid upgrade code. Please check and try again.')
      } else {
        // Success - close modal
        setCode('')
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code')
    } finally {
      setVerifying(false)
    }
  }

  const handleClose = () => {
    setCode('')
    setError(null)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="glass-container p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-heading-lg text-secondary-white mb-2">
          Upgrade to {planName}
        </h2>
        <p className="text-body-sm text-medium-gray mb-6">
          Enter your upgrade code to activate this plan
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm text-secondary-white mb-2">
              Upgrade Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(null)
              }}
              placeholder="Enter your code"
              required
              autoFocus
              className={`w-full px-4 py-3 bg-white/5 border rounded-glass text-secondary-white text-body-md focus:outline-none transition-colors ${
                error
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-cosmic-orange'
              }`}
            />
            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={verifying || loading}
              className="btn-secondary flex-1 py-3 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifying || loading || !code.trim()}
              className="btn-primary flex-1 py-3 disabled:opacity-50"
            >
              {verifying || loading ? 'Upgrading...' : 'Upgrade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
