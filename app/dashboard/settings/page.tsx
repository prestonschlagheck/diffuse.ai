'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/format'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'

type SubscriptionTier = 'free' | 'pro' | 'pro_max'

interface UserProfile {
  id: string
  full_name: string | null
  subscription_tier: SubscriptionTier
}

export default function SettingsPage() {
  const { user, workspaces } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Table doesn't exist or other error - use default profile
        console.warn('user_profiles table not found, using default profile')
        const defaultProfile = {
          id: user.id,
          full_name: null,
          subscription_tier: 'free' as SubscriptionTier,
        }
        setProfile(defaultProfile)
        setLoading(false)
        return
      }

      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
      } else {
        // Create default profile
        const newProfile = {
          id: user.id,
          full_name: null,
          subscription_tier: 'free' as SubscriptionTier,
        }
        
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(newProfile)

        if (insertError) {
          console.warn('Could not insert profile, using default')
          setProfile(newProfile)
        } else {
          setProfile(newProfile)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Use default profile on error
      setProfile({
        id: user.id,
        full_name: null,
        subscription_tier: 'free' as SubscriptionTier,
      })
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      fetchProfile()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }


  const handleDeleteAccount = async () => {
    if (!user) return

    const confirmation = prompt('Type "DELETE" to confirm account deletion:')
    if (confirmation !== 'DELETE') return

    setSaving(true)
    try {
      // In a real app, you'd have a secure backend endpoint for this
      // For now, we'll just sign out
      alert('Account deletion would be processed here. For now, signing out.')
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-secondary-white">Settings</h1>
          <p className="text-body-md text-medium-gray mt-1">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-glass border ${
            message.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-cosmic-orange/10 border-cosmic-orange/30 text-cosmic-orange'
          }`}
        >
          <p className="text-body-sm">{message.text}</p>
        </div>
      )}

      <div className="max-w-4xl">
        {/* Organizations */}
        {workspaces.length > 0 && (
        <div className="glass-container p-6 mb-6">
          <h2 className="text-heading-lg text-secondary-white mb-4">Organizations</h2>
          <div className="divide-y divide-white/10">
            {workspaces.map(({ workspace, role }) => (
              <div key={workspace.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <p className="text-body-md text-secondary-white">{workspace.name}</p>
                <span className="px-3 py-1 text-caption font-medium rounded-full border bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30 capitalize">
                  {role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Settings */}
      <div className="glass-container p-6 mb-6">
        <h2 className="text-heading-lg text-secondary-white mb-6">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-caption text-medium-gray mb-1">Email</label>
            <p className="text-body-md text-secondary-white">{user?.email}</p>
          </div>
          <div>
            <label className="block text-body-sm text-secondary-white mb-2">
              Full Name
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors"
              />
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-6 py-3 disabled:opacity-50 whitespace-nowrap"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Account */}
      <div className="glass-container p-6 flex items-center justify-between">
        <p className="text-body-sm text-medium-gray">
          Once you delete your account, there is no going back.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={saving}
          className="btn-secondary px-6 py-3 text-red-400 hover:text-red-300 disabled:opacity-50 whitespace-nowrap"
        >
          Delete Account
        </button>
      </div>
      </div>
    </div>
  )
}
