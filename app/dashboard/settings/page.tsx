'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/format'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'

type SubscriptionTier = 'free' | 'pro' | 'pro_max'
type UserLevel = 'individual' | 'contractor' | 'admin' | 'enterprise_admin'

interface UserProfile {
  id: string
  full_name: string | null
  subscription_tier: SubscriptionTier
  user_level: UserLevel
}

export default function SettingsPage() {
  const { user, currentWorkspace, workspaces } = useAuth()
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
          user_level: 'individual' as UserLevel,
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
          user_level: 'individual' as UserLevel,
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
        user_level: 'individual' as UserLevel,
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

  const handleChangeSubscription = async (tier: SubscriptionTier) => {
    if (!user || !confirm(`Upgrade to ${tier.replace('_', ' ').toUpperCase()}?`)) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_tier: tier })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Subscription updated successfully!' })
      fetchProfile()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update subscription' })
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

  const userRole = currentWorkspace 
    ? workspaces.find(w => w.workspace.id === currentWorkspace.id)?.role 
    : null

  const subscriptionDetails = {
    free: { name: 'Free', projects: 3, price: '$0' },
    pro: { name: 'Pro', projects: 15, price: '$29/mo' },
    pro_max: { name: 'Pro Max', projects: 'Unlimited', price: '$99/mo' },
  }

  const userLevelLabels: Record<UserLevel, string> = {
    individual: 'Individual',
    contractor: 'Contractor',
    admin: 'Admin',
    enterprise_admin: 'Enterprise Admin',
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const currentSub = subscriptionDetails[profile.subscription_tier] || subscriptionDetails.free

  return (
    <div className="max-w-4xl">
      <h1 className="text-display-sm text-secondary-white mb-8">Settings</h1>

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

      {/* Organization Info */}
      {currentWorkspace && (
        <div className="glass-container p-6 mb-6">
          <h2 className="text-heading-lg text-secondary-white mb-4">Organization</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-caption text-medium-gray mb-1">Name</label>
              <p className="text-body-md text-secondary-white">{currentWorkspace.name}</p>
            </div>
            {currentWorkspace.description && (
              <div>
                <label className="block text-caption text-medium-gray mb-1">Description</label>
                <p className="text-body-md text-secondary-white">{currentWorkspace.description}</p>
              </div>
            )}
            <div>
              <label className="block text-caption text-medium-gray mb-1">Your Role</label>
              <p className="text-body-md text-secondary-white capitalize">
                {userRole || 'member'}
              </p>
            </div>
            <div>
              <label className="block text-caption text-medium-gray mb-1">User Level</label>
              <p className="text-body-md text-cosmic-orange font-medium">
                {userLevelLabels[profile.user_level]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription */}
      <div className="glass-container p-6 mb-6">
        <h2 className="text-heading-lg text-secondary-white mb-4">Subscription</h2>
        <div className="mb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-2xl font-bold text-cosmic-orange">{currentSub.name}</span>
            <span className="text-body-md text-medium-gray">{currentSub.price}</span>
          </div>
          <p className="text-body-sm text-medium-gray">
            {currentSub.projects} {typeof currentSub.projects === 'number' ? 'projects allowed' : 'projects'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(subscriptionDetails) as SubscriptionTier[]).map((tier) => {
            const sub = subscriptionDetails[tier]
            const isCurrent = profile.subscription_tier === tier
            
            return (
              <div
                key={tier}
                className={`p-4 rounded-glass border-2 ${
                  isCurrent
                    ? 'border-cosmic-orange bg-cosmic-orange/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <h3 className="text-heading-md text-secondary-white mb-2">{sub.name}</h3>
                <p className="text-body-lg text-cosmic-orange font-bold mb-2">{sub.price}</p>
                <p className="text-body-sm text-medium-gray mb-4">
                  {sub.projects} projects
                </p>
                {!isCurrent && (
                  <button
                    onClick={() => handleChangeSubscription(tier)}
                    disabled={saving}
                    className="btn-secondary w-full py-2 text-body-sm disabled:opacity-50"
                  >
                    Upgrade
                  </button>
                )}
                {isCurrent && (
                  <button className="btn-primary w-full py-2 text-body-sm cursor-default">
                    Current
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

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
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-3 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="glass-container p-6 border-2 border-red-500/30">
        <h2 className="text-heading-lg text-red-400 mb-4">Danger Zone</h2>
        <p className="text-body-sm text-medium-gray mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={saving}
          className="btn-secondary px-6 py-3 text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}
