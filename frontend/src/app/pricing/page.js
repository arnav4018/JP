'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/store/useAuthStore';
import { 
  Check, 
  X, 
  Star, 
  Crown,
  Zap,
  Users,
  BarChart3,
  Shield,
  Headphones,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Eye,
  MessageCircle,
  FileText,
  Clock,
  DollarSign
} from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'annual'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small businesses and startups',
      icon: Star,
      color: '#6b7280',
      monthly: 29,
      annual: 290,
      features: [
        '3 active job postings',
        'Standard job visibility',
        'Basic candidate filtering',
        'Email notifications',
        'Standard support',
        '30-day job listing duration'
      ],
      limitations: [
        'No featured listings',
        'Limited analytics',
        'No priority support'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing companies',
      icon: Crown,
      color: 'var(--accent-interactive)',
      monthly: 99,
      annual: 990,
      features: [
        '10 active job postings',
        '3 featured listings/month',
        'Advanced candidate filtering',
        'Resume database access',
        'Priority email support',
        'Detailed analytics dashboard',
        '60-day job listing duration',
        'Company page customization'
      ],
      limitations: [
        'No phone support',
        'Limited integrations'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with high-volume hiring',
      icon: Zap,
      color: '#7c3aed',
      monthly: 299,
      annual: 2990,
      features: [
        'Unlimited job postings',
        'Unlimited featured listings',
        'Advanced analytics & reporting',
        'Full resume database access',
        'Dedicated account manager',
        'Phone & priority support',
        'Custom integrations',
        'Bulk job posting',
        'Team collaboration tools',
        'White-label options'
      ],
      limitations: [],
      popular: false
    }
  ];

  const getPrice = (plan) => {
    const price = billingPeriod === 'monthly' ? plan.monthly : plan.annual;
    const monthlyPrice = billingPeriod === 'annual' ? price / 12 : price;
    return { total: price, monthly: monthlyPrice };
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Find the Perfect Plan for Your Hiring Needs
          </h1>
          <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
            Choose from flexible pricing plans designed to help you find and hire the best talent
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span 
              className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'opacity-100' : 'opacity-60'}`}
              style={{ color: 'var(--text-primary)' }}
            >
              Monthly
            </span>
            
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              style={{ backgroundColor: billingPeriod === 'annual' ? 'var(--accent-interactive)' : '#d1d5db' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            
            <div className="flex items-center space-x-2">
              <span 
                className={`text-sm font-medium ${billingPeriod === 'annual' ? 'opacity-100' : 'opacity-60'}`}
                style={{ color: 'var(--text-primary)' }}
              >
                Annual
              </span>
              {billingPeriod === 'annual' && (
                <span 
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
                >
                  Save 17%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const pricing = getPrice(plan);
              const PlanIcon = plan.icon;
              
              return (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  pricing={pricing}
                  billingPeriod={billingPeriod}
                  onSelect={() => handleSelectPlan(plan)}
                  PlanIcon={PlanIcon}
                />
              );
            })}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
            Compare Features
          </h2>
          
          <FeaturesComparison plans={plans} />
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
          
          <FAQSection />
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div 
            className="rounded-2xl p-8 md:p-12"
            style={{ backgroundColor: 'var(--background-panel)', border: '1px solid var(--accent-subtle)' }}
          >
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Ready to Start Hiring?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of companies that trust us with their hiring needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/post-job')}
                className="px-8 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
              >
                Start Free Trial
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="px-8 py-3 border rounded-lg font-medium transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPlan(null);
            }}
            plan={selectedPlan}
            billingPeriod={billingPeriod}
            pricing={getPrice(selectedPlan)}
          />
        )}
      </div>
    </MainLayout>
  );
}

// Pricing Card Component
const PricingCard = ({ plan, pricing, billingPeriod, onSelect, PlanIcon }) => (
  <div 
    className={`relative rounded-2xl p-8 transition-all hover:shadow-lg ${
      plan.popular ? 'ring-2 scale-105' : 'border'
    }`}
    style={{ 
      backgroundColor: 'var(--background-panel)',
      borderColor: plan.popular ? 'var(--accent-interactive)' : 'var(--accent-subtle)'
    }}
  >
    {plan.popular && (
      <div 
        className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium"
        style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
      >
        Most Popular
      </div>
    )}
    
    <div className="text-center mb-8">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: 'var(--accent-subtle)' }}
      >
        <PlanIcon className="h-8 w-8" style={{ color: plan.color }} />
      </div>
      
      <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {plan.name}
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {plan.description}
      </p>
    </div>

    <div className="text-center mb-8">
      <div className="flex items-baseline justify-center space-x-2">
        <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
          ${Math.round(pricing.monthly)}
        </span>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          /month
        </span>
      </div>
      
      {billingPeriod === 'annual' && (
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Billed annually (${pricing.total})
        </p>
      )}
    </div>

    <div className="space-y-4 mb-8">
      {plan.features.map((feature, index) => (
        <div key={index} className="flex items-start space-x-3">
          <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'green' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {feature}
          </span>
        </div>
      ))}
    </div>

    <button
      onClick={onSelect}
      className={`w-full py-3 px-4 rounded-lg font-medium transition-all hover:opacity-90 ${
        plan.popular ? 'text-white' : ''
      }`}
      style={{
        backgroundColor: plan.popular ? 'var(--accent-interactive)' : 'var(--background-deep)',
        color: plan.popular ? 'var(--background-deep)' : 'var(--text-primary)',
        border: plan.popular ? 'none' : '1px solid var(--accent-subtle)'
      }}
    >
      Get Started
    </button>
  </div>
);

// Features Comparison Component
const FeaturesComparison = ({ plans }) => {
  const comparisonFeatures = [
    { category: 'Job Postings', features: [
      { name: 'Active job postings', values: ['3', '10', 'Unlimited'] },
      { name: 'Featured listings', values: ['0', '3/month', 'Unlimited'] },
      { name: 'Job listing duration', values: ['30 days', '60 days', 'Until filled'] }
    ]},
    { category: 'Candidate Management', features: [
      { name: 'Resume database access', values: [false, true, true] },
      { name: 'Advanced filtering', values: [false, true, true] },
      { name: 'Bulk actions', values: [false, false, true] }
    ]},
    { category: 'Analytics & Reporting', features: [
      { name: 'Basic analytics', values: [true, true, true] },
      { name: 'Advanced reporting', values: [false, true, true] },
      { name: 'Custom reports', values: [false, false, true] }
    ]},
    { category: 'Support', features: [
      { name: 'Email support', values: [true, true, true] },
      { name: 'Priority support', values: [false, true, true] },
      { name: 'Phone support', values: [false, false, true] },
      { name: 'Dedicated account manager', values: [false, false, true] }
    ]}
  ];

  return (
    <div 
      className="rounded-lg border overflow-hidden"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <th className="px-6 py-4 text-left font-medium" style={{ color: 'var(--text-primary)' }}>
                Features
              </th>
              {plans.map((plan) => (
                <th key={plan.id} className="px-6 py-4 text-center font-medium" style={{ color: 'var(--text-primary)' }}>
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map((category, categoryIndex) => (
              <>
                <tr key={`category-${categoryIndex}`} style={{ backgroundColor: 'var(--background-deep)' }}>
                  <td colSpan={4} className="px-6 py-3 font-semibold text-sm" style={{ color: 'var(--accent-interactive)' }}>
                    {category.category}
                  </td>
                </tr>
                {category.features.map((feature, featureIndex) => (
                  <tr key={`${categoryIndex}-${featureIndex}`} className="border-t" style={{ borderColor: 'var(--accent-subtle)' }}>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {feature.name}
                    </td>
                    {feature.values.map((value, valueIndex) => (
                      <td key={valueIndex} className="px-6 py-4 text-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="h-5 w-5 mx-auto" style={{ color: 'green' }} />
                          ) : (
                            <X className="h-5 w-5 mx-auto" style={{ color: '#ef4444' }} />
                          )
                        ) : (
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {value}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  
  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly."
    },
    {
      question: "What happens to my job postings if I downgrade?",
      answer: "Your existing job postings will remain active until their expiration date. However, you won't be able to create new postings beyond your new plan's limit."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all plans. If you're not satisfied, contact our support team for a full refund."
    },
    {
      question: "Can I get a custom enterprise plan?",
      answer: "Yes, we offer custom enterprise solutions for large organizations with specific needs. Contact our sales team to discuss your requirements."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. For enterprise plans, we also accept bank transfers."
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div 
          key={index}
          className="border rounded-lg"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        >
          <button
            onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {faq.question}
            </span>
            <ArrowRight 
              className={`h-5 w-5 transition-transform ${openFAQ === index ? 'rotate-90' : ''}`}
              style={{ color: 'var(--text-secondary)' }}
            />
          </button>
          
          {openFAQ === index && (
            <div 
              className="px-6 pb-4 border-t"
              style={{ borderColor: 'var(--accent-subtle)' }}
            >
              <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, plan, billingPeriod, pricing }) => {
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  if (!isOpen) return null;

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      alert(`Successfully subscribed to ${plan.name} plan!`);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div 
          className="relative inline-block w-full max-w-lg p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl"
          style={{ backgroundColor: 'var(--background-panel)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Subscribe to {plan.name}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Plan Summary */}
          <div 
            className="rounded-lg border p-4 mb-6"
            style={{ backgroundColor: 'var(--background-deep)', borderColor: 'var(--accent-subtle)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {plan.name} Plan
              </span>
              <span className="text-lg font-bold" style={{ color: 'var(--accent-interactive)' }}>
                ${pricing.total}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {billingPeriod === 'annual' ? 'Billed annually' : 'Billed monthly'} • 
              ${Math.round(pricing.monthly)}/month
            </p>
          </div>

          {/* Payment form would go here - similar to the job posting payment modal */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Payment Method
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="card"
                  checked={selectedPayment === 'card'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  style={{ accentColor: 'var(--accent-interactive)' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>Credit/Debit Card</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="paypal"
                  checked={selectedPayment === 'paypal'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  style={{ accentColor: 'var(--accent-interactive)' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>PayPal</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg font-medium transition-opacity hover:opacity-80"
              style={{ 
                borderColor: 'var(--accent-subtle)', 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--background-deep)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--accent-interactive)', 
                color: 'var(--background-deep)'
              }}
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};