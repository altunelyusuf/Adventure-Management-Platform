import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentAPI } from '@/services/api';
import { Subscription } from '@/types';
import { CreditCard, Check, X, Crown, Star, Zap, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface SubscriptionPlan {
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  icon: any;
  color: string;
  bgColor: string;
  popular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    tier: 'BASIC',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    icon: Star,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    features: [
      'Create up to 5 quests',
      'Join unlimited quests',
      'Basic achievements',
      'Community access',
      'Mobile app access',
    ],
  },
  {
    tier: 'STANDARD',
    name: 'Standard',
    price: 19.99,
    interval: 'month',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    popular: true,
    features: [
      'Create unlimited quests',
      'Advanced checkpoint features',
      'All achievements unlocked',
      'Priority support',
      'Custom quest themes',
      'Analytics dashboard',
    ],
  },
  {
    tier: 'PREMIUM',
    name: 'Premium',
    price: 29.99,
    interval: 'month',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: [
      'Everything in Standard',
      'Quest monetization',
      'Advanced analytics',
      'API access',
      'White-label options',
      'Dedicated support',
      'Early access to features',
    ],
  },
];

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'STANDARD' | 'PREMIUM' | null>(null);

  const { data: activeSubscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await paymentAPI.getSubscriptions();
      return response.data as Subscription[];
    },
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: (data: { tier: string; paymentMethodId: string }) =>
      paymentAPI.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription activated successfully!');
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create subscription');
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: (subscriptionId: string) => paymentAPI.cancelSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    },
  });

  const handleSubscribe = (tier: 'BASIC' | 'STANDARD' | 'PREMIUM') => {
    setSelectedPlan(tier);
    // In a real app, this would open a Stripe Checkout or Elements form
    // For now, we'll simulate with a payment method ID
    const simulatedPaymentMethodId = 'pm_' + Math.random().toString(36).substring(7);

    if (window.confirm(`Subscribe to ${tier} plan for ${plans.find(p => p.tier === tier)?.price}/month?`)) {
      createSubscriptionMutation.mutate({
        tier,
        paymentMethodId: simulatedPaymentMethodId,
      });
    } else {
      setSelectedPlan(null);
    }
  };

  const handleCancel = (subscriptionId: string) => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      cancelSubscriptionMutation.mutate(subscriptionId);
    }
  };

  const activeSubscription = activeSubscriptions?.find(sub => sub.status === 'ACTIVE');

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">
            Unlock premium features and take your adventures to the next level
          </p>
        </div>

        {/* Active Subscription Banner */}
        {activeSubscription && (
          <div className="mb-8 card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Active Subscription: {activeSubscription.tier}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeSubscription.currentPeriodEnd && (
                      <span>
                        Renews on{' '}
                        {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCancel(activeSubscription.subscriptionId)}
                disabled={cancelSubscriptionMutation.isPending}
                className="btn btn-secondary flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              const isActive = activeSubscription?.tier === plan.tier;
              const isDisabled = activeSubscription && !isActive;

              return (
                <div
                  key={plan.tier}
                  className={`card relative ${
                    plan.popular ? 'ring-2 ring-primary-600 shadow-xl' : ''
                  } ${isActive ? 'bg-primary-50 border-primary-600' : ''} ${
                    isDisabled ? 'opacity-60' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        CURRENT PLAN
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${plan.bgColor} mb-4`}>
                      <PlanIcon className={`h-8 w-8 ${plan.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={isActive || isDisabled || createSubscriptionMutation.isPending}
                    className={`w-full ${
                      isActive
                        ? 'btn bg-green-600 text-white cursor-not-allowed'
                        : plan.popular
                        ? 'btn btn-primary'
                        : 'btn btn-secondary'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : isDisabled ? (
                      'Cancel current plan first'
                    ) : createSubscriptionMutation.isPending && selectedPlan === plan.tier ? (
                      'Processing...'
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment History */}
        {activeSubscriptions && activeSubscriptions.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
              Subscription History
            </h2>
            <div className="space-y-3">
              {activeSubscriptions.map((subscription) => (
                <div
                  key={subscription.subscriptionId}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      subscription.status === 'ACTIVE' ? 'bg-green-100' :
                      subscription.status === 'CANCELLED' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {subscription.status === 'ACTIVE' ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{subscription.tier} Plan</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(subscription.startDate).toLocaleDateString()}
                        </span>
                        {subscription.currentPeriodEnd && (
                          <span>
                            → {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      subscription.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {subscription.status}
                    </span>
                    {subscription.cancelledAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Cancelled {new Date(subscription.cancelledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12 card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan later?</h3>
              <p className="text-sm text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be prorated based on your billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-sm text-gray-600">
                Yes, you can cancel your subscription at any time. You'll retain access to premium features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-sm text-gray-600">
                New users get a 14-day free trial of the Standard plan. No credit card required to start your trial!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
