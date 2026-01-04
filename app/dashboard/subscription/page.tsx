'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'

type SubscriptionTier = 'free' | 'pro' | 'pro_max'

interface UserProfile {
  id: string
  full_name: string | null
  subscription_tier: SubscriptionTier
  user_level: string
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const supabase = createClient()

  const subscriptionDetails = {
    free: { name: 'Free', projects: 3, price: '$0/mo', features: ['3 Projects', 'Basic Support', 'Core Features'] },
    pro: { name: 'Pro', projects: 15, price: '$29/mo', features: ['15 Projects', 'Priority Support', 'Advanced Features', 'Team Collaboration'] },
    pro_max: { name: 'Pro Max', projects: 'Unlimited', price: '$99/mo', features: ['Unlimited Projects', 'Premium Support', 'All Features', 'Advanced Analytics', 'Custom Integrations'] },
  }

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
        const defaultProfile = {
          id: user.id,
          full_name: null,
          subscription_tier: 'free' as SubscriptionTier,
          user_level: 'individual',
        }
        setProfile(defaultProfile)
        setLoading(false)
        return
      }

      if (data) {
        setProfile(data)
      } else {
        const newProfile = {
          id: user.id,
          full_name: null,
          subscription_tier: 'free' as SubscriptionTier,
          user_level: 'individual',
        }
        setProfile(newProfile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile({
        id: user.id,
        full_name: null,
        subscription_tier: 'free' as SubscriptionTier,
        user_level: 'individual',
      })
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleChangeSubscription = async (tier: SubscriptionTier) => {
    if (!user) return

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

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const currentSub = subscriptionDetails[profile.subscription_tier] || subscriptionDetails.free

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-secondary-white mb-2">Subscription</h1>
          <p className="text-body-md text-medium-gray">
            Manage your plan and billing
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

      {/* Current Plan */}
      <div className="glass-container p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-heading-lg text-secondary-white mb-2">Current Plan</h2>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-3xl font-bold text-cosmic-orange">{currentSub.name}</span>
              <span className="text-heading-md text-medium-gray">{currentSub.price}</span>
            </div>
            <p className="text-body-md text-medium-gray">
              {currentSub.projects} {typeof currentSub.projects === 'number' ? 'projects allowed' : 'projects'}
            </p>
          </div>
          <span className="px-4 py-2 bg-cosmic-orange/20 text-cosmic-orange border border-cosmic-orange/30 rounded-full text-body-sm font-medium">
            Active
          </span>
        </div>

        <div className="pt-6 border-t border-white/10">
          <h3 className="text-body-md text-secondary-white mb-3 font-medium">Plan Features</h3>
          <ul className="space-y-2">
            {currentSub.features.map((feature, index) => (
              <li key={index} className="text-body-sm text-medium-gray">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-heading-lg text-secondary-white mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(subscriptionDetails) as SubscriptionTier[])
            .filter((tier) => tier !== profile.subscription_tier)
            .map((tier) => {
              const sub = subscriptionDetails[tier]
              
              return (
                <div
                  key={tier}
                  className="glass-container p-6 border border-white/10"
                >
                  <h3 className="text-heading-md text-secondary-white mb-2">{sub.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-cosmic-orange">{sub.price.split('/')[0]}</span>
                    <span className="text-body-md text-medium-gray">/{sub.price.split('/')[1]}</span>
                  </div>
                  <p className="text-body-sm text-medium-gray mb-6">
                    {sub.projects} {typeof sub.projects === 'number' ? 'projects' : ''}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {sub.features.map((feature, index) => (
                      <li key={index} className="text-body-sm text-medium-gray">
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleChangeSubscription(tier)}
                    disabled={saving}
                    className="btn-secondary w-full py-3 text-body-md disabled:opacity-50"
                  >
                    {tier === 'free' ? 'Downgrade' : 'Upgrade'}
                  </button>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

