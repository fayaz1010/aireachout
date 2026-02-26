'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader, pageHeaderConfigs } from '@/components/ui/page-header'
import { Navigation } from '@/components/ui/navigation'
import { Check, Crown, Zap, Users, Mail, MessageCircle, Phone, Bot, Star, ArrowRight, Shield, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PricingPlan {
  id: string
  name: string
  plan: string
  monthlyPrice: number
  yearlyPrice?: number
  stripePriceId?: string
  stripeYearlyPriceId?: string
  emailLimit: number
  smsLimit: number
  voiceCallLimit: number
  leadsLimit: number
  projectLimit: number
  campaignLimit: number
  features: string[]
  aiPersonalization: boolean
  multiChannel: boolean
  analytics: boolean
  apiAccess: boolean
  prioritySupport: boolean
  description?: string
  isPopular: boolean
}

export default function PricingPage() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    fetchPricingPlans()
  }, [])

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch('/api/pricing-plans')
      if (!response.ok) throw new Error('Failed to fetch pricing plans')
      const data = await response.json()
      setPlans(data)
    } catch (error) {
      console.error('Error fetching pricing plans:', error)
      toast.error('Failed to load pricing plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      toast.error('Please sign in to subscribe')
      return
    }

    setSubscribing(planId)
    
    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) throw new Error('Plan not found')

      const priceId = billingInterval === 'yearly' ? plan.stripeYearlyPriceId : plan.stripePriceId
      
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create subscription')
      }
      
      const { clientSecret, subscriptionId } = await response.json()
      
      // In a real app, you would use Stripe Elements to handle payment
      // For now, we'll show a success message
      toast.success('Subscription created successfully!')
      
    } catch (error: any) {
      console.error('Error creating subscription:', error)
      toast.error(error.message)
    } finally {
      setSubscribing(null)
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Zap className="w-5 h-5" />
      case 'professional':
        return <Users className="w-5 h-5" />
      case 'enterprise':
        return <Crown className="w-5 h-5" />
      default:
        return <Bot className="w-5 h-5" />
    }
  }

  const formatLimit = (limit: number) => {
    if (limit >= 1000000) return `${(limit / 1000000).toFixed(0)}M`
    if (limit >= 1000) return `${(limit / 1000).toFixed(0)}K`
    return limit.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading pricing plans...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageHeader {...pageHeaderConfigs.pricing} />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Trust indicators */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-gray-600">Trusted by 10,000+ businesses worldwide</span>
          </div>
          
          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="bg-white border border-gray-200 p-1 rounded-lg flex shadow-sm">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  billingInterval === 'monthly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  billingInterval === 'yearly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Yearly billing</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Save 20%
                  </Badge>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="grid max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none gap-8">
          {plans.map((plan) => {
            const price = billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
            const hasYearlyPrice = plan.yearlyPrice && plan.yearlyPrice > 0
            const priceAmount = typeof price === 'number' ? price : 0
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.isPopular 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center items-center gap-2 mb-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <div className="text-4xl font-bold">
                    ${priceAmount.toFixed(2)}
                    <span className="text-lg font-normal text-gray-500">
                      /{billingInterval === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingInterval === 'yearly' && hasYearlyPrice && plan.yearlyPrice && (
                    <p className="text-sm text-green-600">
                      Save ${((plan.monthlyPrice * 12 - plan.yearlyPrice) / 100).toFixed(2)} per year
                    </p>
                  )}
                  <CardDescription className="mt-4">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Usage Limits */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        {formatLimit(plan.emailLimit)} emails/month
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        {formatLimit(plan.smsLimit)} SMS/month
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">
                        {formatLimit(plan.voiceCallLimit)} voice calls/month
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">
                        {formatLimit(plan.leadsLimit)} leads/month
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Features</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                      {plan.aiPersonalization && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">AI Personalization</span>
                        </li>
                      )}
                      {plan.multiChannel && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">Multi-channel Campaigns</span>
                        </li>
                      )}
                      {plan.analytics && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">Advanced Analytics</span>
                        </li>
                      )}
                      {plan.apiAccess && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">API Access</span>
                        </li>
                      )}
                      {plan.prioritySupport && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">Priority Support</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing === plan.id}
                    variant={plan.isPopular ? 'default' : 'outline'}
                  >
                    {subscribing === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {/* FAQ or Support Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Need Help Choosing?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Not sure which plan is right for you? Our team is here to help you find the perfect solution for your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => window.open('/contact-sales', '_blank')}>
                  Contact Sales
                </Button>
                <Button variant="outline" onClick={() => window.open('/help', '_blank')}>
                  View FAQ
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                ✓ 14-day free trial • ✓ No setup fees • ✓ Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
