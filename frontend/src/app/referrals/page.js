'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/store/useAuthStore';
import { 
  Share2, 
  Copy, 
  Users, 
  DollarSign, 
  TrendingUp,
  Gift,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  UserPlus,
  Linkedin,
  Twitter,
  Facebook,
  MessageCircle,
  Mail,
  Link,
  QrCode,
  Download,
  ExternalLink,
  Award,
  Target,
  Zap,
  BarChart3,
  CreditCard,
  Shield,
  X,
  Plus,
  Edit,
  Trash2,
  Settings,
  Wallet,
  Building
} from 'lucide-react';

export default function ReferralSystem() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'referrals', 'earnings'
  
  // Mock referral data - in real app, this would come from API
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 15,
    successfulPlacements: 6,
    pendingReferrals: 4,
    totalEarnings: 2500,
    pendingEarnings: 800
  });

  const [referralHistory, setReferralHistory] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      position: 'Frontend Developer',
      company: 'TechCorp Inc.',
      status: 'placed',
      bonus: 500,
      referredDate: '2024-01-15',
      placedDate: '2024-02-01'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      position: 'Data Analyst',
      company: 'DataFlow Solutions',
      status: 'interview',
      bonus: 400,
      referredDate: '2024-01-20',
      interviewDate: '2024-02-10'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.w@email.com',
      position: 'DevOps Engineer',
      company: 'CloudTech Ltd',
      status: 'pending',
      bonus: 600,
      referredDate: '2024-01-25'
    }
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/referrals'));
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent-interactive)' }}></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const referralLink = `https://jobportal.com/register?ref=${user?.id || 'USER123'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSocialShare = (platform) => {
    const text = "Join this amazing job portal and find your dream job! Use my referral link:";
    const encodedText = encodeURIComponent(text);
    const encodedLink = encodeURIComponent(referralLink);
    
    const urls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedLink}`,
      email: `mailto:?subject=Join this Job Portal&body=${text}%0A%0A${referralLink}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'rgb(249, 168, 37)', color: 'white', text: 'Pending' },
      interview: { bg: 'rgb(59, 130, 246)', color: 'white', text: 'Interview' },
      placed: { bg: 'rgb(34, 197, 94)', color: 'white', text: 'Placed' },
      rejected: { bg: 'rgb(239, 68, 68)', color: 'white', text: 'Rejected' }
    };
    
    const style = styles[status] || styles.pending;
    
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {style.text}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Refer & Earn
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Share job opportunities with your network and earn rewards for successful placements
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 p-1 mb-8 rounded-lg w-fit" style={{ backgroundColor: 'var(--background-panel)' }}>
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'referrals', label: 'My Referrals', icon: Users },
              { id: 'earnings', label: 'Earnings', icon: DollarSign }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--accent-interactive)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--background-deep)' : 'var(--text-secondary)'
                }}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  title="Total Referrals"
                  value={referralStats.totalReferrals}
                  subtitle="People referred"
                  color="var(--accent-interactive)"
                />
                <StatCard
                  icon={CheckCircle}
                  title="Successful Placements"
                  value={referralStats.successfulPlacements}
                  subtitle={`${Math.round((referralStats.successfulPlacements / referralStats.totalReferrals) * 100)}% success rate`}
                  color="rgb(34, 197, 94)"
                />
                <StatCard
                  icon={DollarSign}
                  title="Total Earnings"
                  value={`$${referralStats.totalEarnings}`}
                  subtitle="From referrals"
                  color="rgb(168, 85, 247)"
                />
                <StatCard
                  icon={Clock}
                  title="Pending Earnings"
                  value={`$${referralStats.pendingEarnings}`}
                  subtitle="Awaiting placement"
                  color="rgb(249, 168, 37)"
                />
              </div>

              {/* Referral Link Section */}
              <div 
                className="rounded-lg border p-6"
                style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Your Referral Link
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Share this link with your network to earn referral bonuses
                    </p>
                  </div>
                  <Share2 className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div 
                    className="flex-1 p-3 border rounded-lg font-mono text-sm break-all"
                    style={{ 
                      backgroundColor: 'var(--accent-subtle)', 
                      borderColor: 'var(--accent-interactive)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {referralLink}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                      style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    
                    <button
                      onClick={() => setShareModalOpen(true)}
                      className="flex items-center space-x-2 px-4 py-2 border rounded-lg font-medium transition-opacity hover:opacity-80"
                      style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* How it Works */}
              <div 
                className="rounded-lg border p-6"
                style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
              >
                <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  How It Works
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: 'var(--accent-subtle)' }}
                    >
                      <Share2 className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
                    </div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      1. Share Your Link
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Share your unique referral link with friends, family, or professional network
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: 'var(--accent-subtle)' }}
                    >
                      <UserPlus className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
                    </div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      2. They Join & Apply
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Your referrals sign up using your link and apply for jobs on our platform
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: 'var(--accent-subtle)' }}
                    >
                      <DollarSign className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
                    </div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      3. You Earn Rewards
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Get paid when your referrals successfully land a job through our platform
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div 
                className="rounded-lg border p-6"
                style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Recent Referral Activity
                  </h2>
                  <button
                    onClick={() => setActiveTab('referrals')}
                    className="flex items-center space-x-2 text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--accent-interactive)' }}
                  >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {referralHistory.slice(0, 3).map(referral => (
                    <div 
                      key={referral.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      style={{ borderColor: 'var(--accent-subtle)' }}
                    >
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--accent-subtle)' }}
                        >
                          <span className="font-medium" style={{ color: 'var(--accent-interactive)' }}>
                            {referral.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {referral.name}
                          </h4>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {referral.position} at {referral.company}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(referral.status)}
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          ${referral.bonus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <ReferralsTab referralHistory={referralHistory} getStatusBadge={getStatusBadge} />
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <EarningsTab referralStats={referralStats} referralHistory={referralHistory} />
          )}

          {/* Share Modal */}
          {shareModalOpen && (
            <ShareModal
              referralLink={referralLink}
              onClose={() => setShareModalOpen(false)}
              onSocialShare={handleSocialShare}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <div 
    className="rounded-lg border p-6"
    style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
  >
    <div className="flex items-center space-x-3 mb-4">
      <Icon className="h-8 w-8" style={{ color }} />
      <div>
        <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </h3>
      </div>
    </div>
    <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
      {value}
    </div>
    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
      {subtitle}
    </p>
  </div>
);

// Referrals Tab Component
const ReferralsTab = ({ referralHistory, getStatusBadge }) => (
  <div className="space-y-6">
    <div 
      className="rounded-lg border"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'var(--accent-subtle)' }}>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          All Referrals ({referralHistory.length})
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track the progress of all your referrals
        </p>
      </div>
      
      <div className="divide-y" style={{ borderColor: 'var(--accent-subtle)' }}>
        {referralHistory.map(referral => (
          <div key={referral.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-subtle)' }}
                >
                  <span className="font-medium" style={{ color: 'var(--accent-interactive)' }}>
                    {referral.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {referral.name}
                    </h3>
                    {getStatusBadge(referral.status)}
                  </div>
                  
                  <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <p>{referral.email}</p>
                    <p><strong>Position:</strong> {referral.position}</p>
                    <p><strong>Company:</strong> {referral.company}</p>
                    <p><strong>Referred:</strong> {new Date(referral.referredDate).toLocaleDateString()}</p>
                    {referral.placedDate && (
                      <p><strong>Placed:</strong> {new Date(referral.placedDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  ${referral.bonus}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Referral bonus
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Earnings Tab Component
const EarningsTab = ({ referralStats, referralHistory }) => {
  const [activeEarningsTab, setActiveEarningsTab] = useState('overview');
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          className="rounded-lg border p-6"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="h-8 w-8" style={{ color: 'rgb(34, 197, 94)' }} />
            <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>
              Total Earned
            </h3>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            ${referralStats.totalEarnings}
          </div>
        </div>

        <div 
          className="rounded-lg border p-6"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-8 w-8" style={{ color: 'rgb(249, 168, 37)' }} />
            <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>
              Pending
            </h3>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            ${referralStats.pendingEarnings}
          </div>
        </div>

        <div 
          className="rounded-lg border p-6"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
            <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>
              Available
            </h3>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            ${referralStats.totalEarnings - 1200}
          </div>
        </div>

        <div 
          className="rounded-lg border p-6"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <Target className="h-8 w-8" style={{ color: 'rgb(168, 85, 247)' }} />
            <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>
              This Month
            </h3>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            $900
          </div>
        </div>
      </div>

      {/* Earnings Tabs */}
      <div className="flex space-x-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--background-panel)' }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'payouts', label: 'Payouts', icon: DollarSign },
          { id: 'history', label: 'History', icon: Clock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveEarningsTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeEarningsTab === tab.id ? 'opacity-100' : 'opacity-60 hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeEarningsTab === tab.id ? 'var(--accent-interactive)' : 'transparent',
              color: activeEarningsTab === tab.id ? 'var(--background-deep)' : 'var(--text-secondary)'
            }}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeEarningsTab === 'overview' && (
        <EarningsOverview 
          referralStats={referralStats} 
          onSetupPayment={() => setShowPaymentSetup(true)}
          onWithdraw={() => setShowWithdrawModal(true)}
        />
      )}

      {activeEarningsTab === 'payouts' && (
        <PayoutsTab 
          onSetupPayment={() => setShowPaymentSetup(true)}
          onWithdraw={() => setShowWithdrawModal(true)}
        />
      )}

      {activeEarningsTab === 'history' && (
        <PaymentHistoryTab />
      )}

      {/* Payment Setup Modal */}
      {showPaymentSetup && (
        <PaymentSetupModal
          isOpen={showPaymentSetup}
          onClose={() => setShowPaymentSetup(false)}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          availableBalance={referralStats.totalEarnings - 1200}
        />
      )}
    </div>
  );
};

// Share Modal Component
const ShareModal = ({ referralLink, onClose, onSocialShare }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
      
      <div 
        className="relative inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl"
        style={{ backgroundColor: 'var(--background-panel)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Share Your Referral Link
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onSocialShare('linkedin')}
            className="flex items-center space-x-3 p-3 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--accent-subtle)' }}
          >
            <Linkedin className="h-5 w-5 text-blue-600" />
            <span style={{ color: 'var(--text-primary)' }}>LinkedIn</span>
          </button>

          <button
            onClick={() => onSocialShare('twitter')}
            className="flex items-center space-x-3 p-3 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--accent-subtle)' }}
          >
            <Twitter className="h-5 w-5 text-blue-400" />
            <span style={{ color: 'var(--text-primary)' }}>Twitter</span>
          </button>

          <button
            onClick={() => onSocialShare('facebook')}
            className="flex items-center space-x-3 p-3 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--accent-subtle)' }}
          >
            <Facebook className="h-5 w-5 text-blue-700" />
            <span style={{ color: 'var(--text-primary)' }}>Facebook</span>
          </button>

          <button
            onClick={() => onSocialShare('whatsapp')}
            className="flex items-center space-x-3 p-3 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--accent-subtle)' }}
          >
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span style={{ color: 'var(--text-primary)' }}>WhatsApp</span>
          </button>

          <button
            onClick={() => onSocialShare('email')}
            className="flex items-center space-x-3 p-3 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--accent-subtle)' }}
          >
            <Mail className="h-5 w-5 text-gray-600" />
            <span style={{ color: 'var(--text-primary)' }}>Email</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              onClose();
            }}
            className="flex items-center space-x-3 p-3 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--accent-subtle)' }}
          >
            <Copy className="h-5 w-5 text-gray-600" />
            <span style={{ color: 'var(--text-primary)' }}>Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Earnings Overview Component
const EarningsOverview = ({ referralStats, onSetupPayment, onWithdraw }) => (
  <div className="space-y-6">
    <div 
      className="rounded-lg border p-6"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Earnings Summary
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track your referral earnings and setup payouts
          </p>
        </div>
        <button
          onClick={onWithdraw}
          className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
        >
          Withdraw Funds
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center p-6 border rounded-lg" style={{ borderColor: 'var(--accent-subtle)' }}>
          <Wallet className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--accent-interactive)' }} />
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Available Balance</h4>
          <p className="text-3xl font-bold" style={{ color: 'var(--accent-interactive)' }}>
            ${referralStats.totalEarnings - 1200}
          </p>
        </div>
        
        <div className="text-center p-6 border rounded-lg" style={{ borderColor: 'var(--accent-subtle)' }}>
          <Clock className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgb(249, 168, 37)' }} />
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Processing</h4>
          <p className="text-3xl font-bold" style={{ color: 'rgb(249, 168, 37)' }}>
            ${referralStats.pendingEarnings}
          </p>
        </div>
      </div>
    </div>
    
    <div 
      className="rounded-lg border p-6"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onSetupPayment}
          className="flex items-center space-x-3 p-4 border rounded-lg hover:opacity-80 transition-opacity"
          style={{ borderColor: 'var(--accent-subtle)' }}
        >
          <Settings className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
          <div className="text-left">
            <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Setup Payment Method</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add your preferred payout method</p>
          </div>
        </button>
        
        <button
          className="flex items-center space-x-3 p-4 border rounded-lg hover:opacity-80 transition-opacity"
          style={{ borderColor: 'var(--accent-subtle)' }}
        >
          <BarChart3 className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
          <div className="text-left">
            <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>View Analytics</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Detailed earning reports</p>
          </div>
        </button>
      </div>
    </div>
  </div>
);

// Payouts Tab Component
const PayoutsTab = ({ onSetupPayment, onWithdraw }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'PayPal',
      email: 'user@example.com',
      isDefault: true,
      icon: '💳'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Available Balance */}
      <div 
        className="rounded-lg border p-6"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Available for Withdrawal
            </h3>
            <p className="text-3xl font-bold" style={{ color: 'var(--accent-interactive)' }}>
              $1,300
            </p>
          </div>
          <button
            onClick={onWithdraw}
            className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
          >
            Withdraw Now
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div 
        className="rounded-lg border"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
      >
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--accent-subtle)' }}>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Payment Methods
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your payout preferences
            </p>
          </div>
          <button
            onClick={onSetupPayment}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
          >
            <Plus className="h-4 w-4" />
            <span>Add Method</span>
          </button>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--accent-subtle)' }}>
          {paymentMethods.map(method => (
            <div key={method.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'var(--accent-subtle)' }}
                >
                  {method.icon}
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {method.type}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {method.email}
                  </p>
                  {method.isDefault && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full mt-1 inline-block"
                      style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
                    >
                      Default
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="p-2 rounded hover:opacity-80 transition-opacity text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Payment History Tab Component
const PaymentHistoryTab = () => {
  const paymentHistory = [
    {
      id: 1,
      amount: 500,
      method: 'PayPal',
      status: 'Completed',
      date: '2024-01-15',
      transactionId: 'TXN123456'
    },
    {
      id: 2,
      amount: 400,
      method: 'Bank Transfer',
      status: 'Processing',
      date: '2024-01-10',
      transactionId: 'TXN123457'
    },
    {
      id: 3,
      amount: 300,
      method: 'UPI',
      status: 'Completed',
      date: '2024-01-05',
      transactionId: 'TXN123458'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'rgb(34, 197, 94)';
      case 'Processing':
        return 'rgb(249, 168, 37)';
      case 'Failed':
        return 'rgb(239, 68, 68)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div 
      className="rounded-lg border"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'var(--accent-subtle)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Payment History
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track all your payout transactions
        </p>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--accent-subtle)' }}>
        {paymentHistory.map(payment => (
          <div key={payment.id} className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-subtle)' }}
              >
                <DollarSign className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
              </div>
              <div>
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  ${payment.amount} withdrawal
                </h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  via {payment.method} • {new Date(payment.date).toLocaleDateString()}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {payment.transactionId}
                </p>
              </div>
            </div>
            
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: `${getStatusColor(payment.status)}20`, 
                color: getStatusColor(payment.status) 
              }}
            >
              {payment.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Payment Setup Modal Component
const PaymentSetupModal = ({ isOpen, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState('paypal');
  const [formData, setFormData] = useState({
    paypal: { email: '' },
    upi: { upiId: '' },
    bank: { accountNumber: '', routingNumber: '', accountHolderName: '' },
    crypto: { walletAddress: '', currency: 'BTC' }
  });

  if (!isOpen) return null;

  const handleInputChange = (method, field, value) => {
    setFormData(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    // Simulate saving payment method
    alert('Payment method added successfully!');
    onClose();
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
              Add Payment Method
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Choose Payment Method
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'paypal', name: 'PayPal', icon: '💳' },
                { id: 'upi', name: 'UPI', icon: '📱' },
                { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
                { id: 'crypto', name: 'Cryptocurrency', icon: '₿' }
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                    selectedMethod === method.id ? 'ring-2' : ''
                  }`}
                  style={{ 
                    borderColor: selectedMethod === method.id ? 'var(--accent-interactive)' : 'var(--accent-subtle)',
                    ringColor: 'var(--accent-interactive)'
                  }}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {method.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Forms */}
          <div className="mb-6">
            {selectedMethod === 'paypal' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  PayPal Email
                </label>
                <input
                  type="email"
                  value={formData.paypal.email}
                  onChange={(e) => handleInputChange('paypal', 'email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background-deep)',
                    borderColor: 'var(--accent-subtle)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="your-email@paypal.com"
                />
              </div>
            )}

            {selectedMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  UPI ID
                </label>
                <input
                  type="text"
                  value={formData.upi.upiId}
                  onChange={(e) => handleInputChange('upi', 'upiId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background-deep)',
                    borderColor: 'var(--accent-subtle)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="yourname@paytm"
                />
              </div>
            )}

            {selectedMethod === 'bank' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={formData.bank.accountHolderName}
                    onChange={(e) => handleInputChange('bank', 'accountHolderName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.bank.accountNumber}
                    onChange={(e) => handleInputChange('bank', 'accountNumber', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Routing Number
                  </label>
                  <input
                    type="text"
                    value={formData.bank.routingNumber}
                    onChange={(e) => handleInputChange('bank', 'routingNumber', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="123456789"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'crypto' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Cryptocurrency
                  </label>
                  <select
                    value={formData.crypto.currency}
                    onChange={(e) => handleInputChange('crypto', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="USDT">Tether (USDT)</option>
                    <option value="USDC">USD Coin (USDC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={formData.crypto.walletAddress}
                    onChange={(e) => handleInputChange('crypto', 'walletAddress', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="1A2B3C4D5E6F7G8H9I0J..."
                  />
                </div>
              </div>
            )}
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
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--accent-interactive)', 
                color: 'var(--background-deep)'
              }}
            >
              Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Withdraw Modal Component
const WithdrawModal = ({ isOpen, onClose, availableBalance }) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('paypal');

  if (!isOpen) return null;

  const handleWithdraw = () => {
    // Simulate withdrawal
    alert(`Withdrawal of $${amount} initiated via ${selectedMethod}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div 
          className="relative inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl"
          style={{ backgroundColor: 'var(--background-panel)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Withdraw Funds
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="text-center p-4 border rounded-lg mb-4" style={{ borderColor: 'var(--accent-subtle)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Available Balance</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent-interactive)' }}>
                ${availableBalance}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Withdrawal Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background-deep)',
                    borderColor: 'var(--accent-subtle)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter amount"
                  max={availableBalance}
                />
                
                <div className="flex space-x-2 mt-2">
                  {[25, 50, 75, 100].map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => setAmount(Math.floor(availableBalance * percentage / 100))}
                      className="px-3 py-1 text-xs border rounded transition-opacity hover:opacity-80"
                      style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Payment Method
                </label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background-deep)',
                    borderColor: 'var(--accent-subtle)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="paypal">PayPal - user@example.com</option>
                  <option value="bank">Bank Transfer - *****1234</option>
                  <option value="upi">UPI - user@paytm</option>
                </select>
              </div>
            </div>
          </div>

          {/* Processing Info */}
          <div 
            className="p-3 rounded-lg mb-6 text-sm"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
          >
            💡 Withdrawals typically process within 2-5 business days depending on the payment method.
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
              onClick={handleWithdraw}
              disabled={!amount || amount <= 0 || amount > availableBalance}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--accent-interactive)', 
                color: 'var(--background-deep)'
              }}
            >
              Withdraw ${amount || '0'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
