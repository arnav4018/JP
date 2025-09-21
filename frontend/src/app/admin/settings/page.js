'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuthStore';
import { 
  Settings,
  Save,
  RefreshCw,
  DollarSign,
  CreditCard,
  Shield,
  Users,
  Mail,
  Bell,
  Globe,
  Database,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Upload,
  Download,
  Trash2,
  Plus,
  Minus,
  Edit,
  FileText,
  Calendar,
  Clock,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Server,
  Cloud,
  Key,
  UserCheck,
  Building,
  Briefcase,
  MessageSquare,
  Search,
  Filter,
  Archive,
  RotateCcw
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Payment Settings
    payment: {
      requirePaymentForFeaturedJobs: true,
      requirePaymentForJobPosting: false,
      allowFreeTrialJobPosting: true,
      featuredJobPrice: 99.99,
      basicJobPostingPrice: 19.99,
      subscriptionPlansEnabled: true,
      refundPeriodDays: 7,
      autoRenewSubscriptions: true,
      paymentGatewayStripe: true,
      paymentGatewayPaypal: true,
      paymentGatewayUPI: false,
      commissionPercentage: 5.0
    },
    
    // System Settings
    system: {
      maintenanceMode: false,
      allowNewRegistrations: true,
      requireEmailVerification: true,
      enableTwoFactorAuth: false,
      sessionTimeoutMinutes: 60,
      maxFileUploadSizeMB: 10,
      enableAutomaticBackups: true,
      backupFrequencyHours: 24,
      logRetentionDays: 30,
      enableCaching: true,
      cacheExpirationMinutes: 30,
      rateLimitRequestsPerMinute: 100
    },
    
    // User & Content Settings
    content: {
      moderateJobPostings: true,
      autoApproveFromVerifiedCompanies: false,
      requireCompanyVerification: true,
      allowJobEditAfterPosting: true,
      jobExpirationDays: 30,
      maxJobsPerCompany: 50,
      enableUserReviews: true,
      moderateUserReviews: true,
      allowAnonymousApplications: false,
      enableJobAlerts: true,
      maxJobAlertsPerUser: 10
    },
    
    // Communication Settings
    notifications: {
      enableEmailNotifications: true,
      enablePushNotifications: true,
      enableSMSNotifications: false,
      notifyAdminNewJob: true,
      notifyAdminNewUser: true,
      notifyAdminPayments: true,
      emailFromName: 'JobPortal Admin',
      emailFromAddress: 'admin@jobportal.com',
      enableChatSupport: true,
      autoResponseEnabled: true,
      supportHours: '9 AM - 6 PM UTC'
    },

    // Security Settings
    security: {
      enforceStrongPasswords: true,
      enableAccountLockout: true,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 30,
      enableIPWhitelist: false,
      allowedIPs: [],
      enableAuditLogging: true,
      requireHTTPS: true,
      enableCSRFProtection: true,
      cookieSecureFlag: true,
      sessionCookieHttpOnly: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');
  const [showResetModal, setShowResetModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    payment: true,
    system: true,
    content: true,
    notifications: true,
    security: true
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In real app, this would fetch from API
      // For now, using default settings defined above
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In real app, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      setLastSaved(new Date());
      setUnsavedChanges(false);
      
      // Show success feedback
      const successAlert = document.createElement('div');
      successAlert.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successAlert.textContent = 'Settings saved successfully!';
      document.body.appendChild(successAlert);
      setTimeout(() => document.body.removeChild(successAlert), 3000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    setShowResetModal(false);
    // Reset to default settings
    loadSettings();
    setUnsavedChanges(false);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const tabs = [
    { id: 'payment', name: 'Payment & Billing', icon: DollarSign },
    { id: 'system', name: 'System', icon: Server },
    { id: 'content', name: 'Content & Users', icon: Users },
    { id: 'notifications', name: 'Communications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, disabled = false, label, description }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
        {description && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        style={{
          backgroundColor: checked ? 'var(--accent-interactive)' : 'var(--accent-subtle)'
        }}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  // Input Component
  const InputField = ({ type = 'text', label, value, onChange, placeholder, disabled = false, min, max, step }) => (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--background-deep)',
          borderColor: 'var(--accent-subtle)',
          color: 'var(--text-primary)'
        }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Admin Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Configure system settings, payment options, and security preferences
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {unsavedChanges && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Unsaved changes</span>
            </div>
          )}
          
          {lastSaved && (
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Last saved: {lastSaved.toLocaleString()}
            </div>
          )}
          
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleSaveSettings}
            disabled={saving || !unsavedChanges}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
            style={{ backgroundColor: 'var(--accent-interactive)' }}
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div 
        className="rounded-lg border"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
      >
        <div className="border-b" style={{ borderColor: 'var(--accent-subtle)' }}>
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent hover:opacity-80'
                  }`}
                  style={{ 
                    color: activeTab === tab.id ? 'var(--accent-interactive)' : 'var(--text-secondary)',
                    borderBottomColor: activeTab === tab.id ? 'var(--accent-interactive)' : 'transparent'
                  }}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Payment & Billing Configuration
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Job Posting Payments</h4>
                    
                    <ToggleSwitch
                      checked={settings.payment.requirePaymentForFeaturedJobs}
                      onChange={(value) => handleSettingChange('payment', 'requirePaymentForFeaturedJobs', value)}
                      label="Require Payment for Featured Jobs"
                      description="Enable paid promotion for job listings"
                    />
                    
                    <ToggleSwitch
                      checked={settings.payment.requirePaymentForJobPosting}
                      onChange={(value) => handleSettingChange('payment', 'requirePaymentForJobPosting', value)}
                      label="Require Payment for Job Posting"
                      description="Charge companies for posting any job"
                    />
                    
                    <ToggleSwitch
                      checked={settings.payment.allowFreeTrialJobPosting}
                      onChange={(value) => handleSettingChange('payment', 'allowFreeTrialJobPosting', value)}
                      label="Allow Free Trial Job Posting"
                      description="Allow new companies to post jobs for free initially"
                    />
                    
                    <InputField
                      type="number"
                      label="Featured Job Price ($)"
                      value={settings.payment.featuredJobPrice}
                      onChange={(value) => handleSettingChange('payment', 'featuredJobPrice', parseFloat(value))}
                      placeholder="99.99"
                      min="0"
                      step="0.01"
                    />
                    
                    <InputField
                      type="number"
                      label="Basic Job Posting Price ($)"
                      value={settings.payment.basicJobPostingPrice}
                      onChange={(value) => handleSettingChange('payment', 'basicJobPostingPrice', parseFloat(value))}
                      placeholder="19.99"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Subscription & Billing</h4>
                    
                    <ToggleSwitch
                      checked={settings.payment.subscriptionPlansEnabled}
                      onChange={(value) => handleSettingChange('payment', 'subscriptionPlansEnabled', value)}
                      label="Enable Subscription Plans"
                      description="Allow companies to subscribe to monthly/yearly plans"
                    />
                    
                    <ToggleSwitch
                      checked={settings.payment.autoRenewSubscriptions}
                      onChange={(value) => handleSettingChange('payment', 'autoRenewSubscriptions', value)}
                      label="Auto-Renew Subscriptions"
                      description="Automatically renew subscriptions before expiry"
                    />
                    
                    <InputField
                      type="number"
                      label="Refund Period (days)"
                      value={settings.payment.refundPeriodDays}
                      onChange={(value) => handleSettingChange('payment', 'refundPeriodDays', parseInt(value))}
                      placeholder="7"
                      min="0"
                      max="30"
                    />
                    
                    <InputField
                      type="number"
                      label="Commission Percentage (%)"
                      value={settings.payment.commissionPercentage}
                      onChange={(value) => handleSettingChange('payment', 'commissionPercentage', parseFloat(value))}
                      placeholder="5.0"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Payment Gateways</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ToggleSwitch
                      checked={settings.payment.paymentGatewayStripe}
                      onChange={(value) => handleSettingChange('payment', 'paymentGatewayStripe', value)}
                      label="Stripe"
                      description="Enable Stripe payments"
                    />
                    
                    <ToggleSwitch
                      checked={settings.payment.paymentGatewayPaypal}
                      onChange={(value) => handleSettingChange('payment', 'paymentGatewayPaypal', value)}
                      label="PayPal"
                      description="Enable PayPal payments"
                    />
                    
                    <ToggleSwitch
                      checked={settings.payment.paymentGatewayUPI}
                      onChange={(value) => handleSettingChange('payment', 'paymentGatewayUPI', value)}
                      label="UPI"
                      description="Enable UPI payments (India)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  System Configuration
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>General System</h4>
                    
                    <ToggleSwitch
                      checked={settings.system.maintenanceMode}
                      onChange={(value) => handleSettingChange('system', 'maintenanceMode', value)}
                      label="Maintenance Mode"
                      description="Put the system in maintenance mode"
                    />
                    
                    <ToggleSwitch
                      checked={settings.system.allowNewRegistrations}
                      onChange={(value) => handleSettingChange('system', 'allowNewRegistrations', value)}
                      label="Allow New Registrations"
                      description="Allow new users to register accounts"
                    />
                    
                    <ToggleSwitch
                      checked={settings.system.requireEmailVerification}
                      onChange={(value) => handleSettingChange('system', 'requireEmailVerification', value)}
                      label="Require Email Verification"
                      description="Users must verify email before accessing features"
                    />
                    
                    <ToggleSwitch
                      checked={settings.system.enableTwoFactorAuth}
                      onChange={(value) => handleSettingChange('system', 'enableTwoFactorAuth', value)}
                      label="Two-Factor Authentication"
                      description="Enable 2FA for enhanced security"
                    />
                    
                    <InputField
                      type="number"
                      label="Session Timeout (minutes)"
                      value={settings.system.sessionTimeoutMinutes}
                      onChange={(value) => handleSettingChange('system', 'sessionTimeoutMinutes', parseInt(value))}
                      placeholder="60"
                      min="5"
                      max="1440"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Performance & Storage</h4>
                    
                    <InputField
                      type="number"
                      label="Max File Upload Size (MB)"
                      value={settings.system.maxFileUploadSizeMB}
                      onChange={(value) => handleSettingChange('system', 'maxFileUploadSizeMB', parseInt(value))}
                      placeholder="10"
                      min="1"
                      max="100"
                    />
                    
                    <ToggleSwitch
                      checked={settings.system.enableCaching}
                      onChange={(value) => handleSettingChange('system', 'enableCaching', value)}
                      label="Enable Caching"
                      description="Cache frequently accessed data"
                    />
                    
                    <InputField
                      type="number"
                      label="Cache Expiration (minutes)"
                      value={settings.system.cacheExpirationMinutes}
                      onChange={(value) => handleSettingChange('system', 'cacheExpirationMinutes', parseInt(value))}
                      placeholder="30"
                      min="1"
                      max="1440"
                    />
                    
                    <InputField
                      type="number"
                      label="Rate Limit (requests/minute)"
                      value={settings.system.rateLimitRequestsPerMinute}
                      onChange={(value) => handleSettingChange('system', 'rateLimitRequestsPerMinute', parseInt(value))}
                      placeholder="100"
                      min="10"
                      max="1000"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Backup & Logging</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ToggleSwitch
                      checked={settings.system.enableAutomaticBackups}
                      onChange={(value) => handleSettingChange('system', 'enableAutomaticBackups', value)}
                      label="Automatic Backups"
                      description="Schedule automatic data backups"
                    />
                    
                    <InputField
                      type="number"
                      label="Backup Frequency (hours)"
                      value={settings.system.backupFrequencyHours}
                      onChange={(value) => handleSettingChange('system', 'backupFrequencyHours', parseInt(value))}
                      placeholder="24"
                      min="1"
                      max="168"
                    />
                    
                    <InputField
                      type="number"
                      label="Log Retention (days)"
                      value={settings.system.logRetentionDays}
                      onChange={(value) => handleSettingChange('system', 'logRetentionDays', parseInt(value))}
                      placeholder="30"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content & Users Settings */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Content & User Management
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Job Moderation</h4>
                    
                    <ToggleSwitch
                      checked={settings.content.moderateJobPostings}
                      onChange={(value) => handleSettingChange('content', 'moderateJobPostings', value)}
                      label="Moderate Job Postings"
                      description="Require admin approval for new job posts"
                    />
                    
                    <ToggleSwitch
                      checked={settings.content.autoApproveFromVerifiedCompanies}
                      onChange={(value) => handleSettingChange('content', 'autoApproveFromVerifiedCompanies', value)}
                      label="Auto-Approve Verified Companies"
                      description="Skip moderation for verified companies"
                    />
                    
                    <ToggleSwitch
                      checked={settings.content.requireCompanyVerification}
                      onChange={(value) => handleSettingChange('content', 'requireCompanyVerification', value)}
                      label="Require Company Verification"
                      description="Companies must be verified to post jobs"
                    />
                    
                    <ToggleSwitch
                      checked={settings.content.allowJobEditAfterPosting}
                      onChange={(value) => handleSettingChange('content', 'allowJobEditAfterPosting', value)}
                      label="Allow Job Edit After Posting"
                      description="Companies can edit jobs after publishing"
                    />
                    
                    <InputField
                      type="number"
                      label="Job Expiration (days)"
                      value={settings.content.jobExpirationDays}
                      onChange={(value) => handleSettingChange('content', 'jobExpirationDays', parseInt(value))}
                      placeholder="30"
                      min="1"
                      max="365"
                    />
                    
                    <InputField
                      type="number"
                      label="Max Jobs per Company"
                      value={settings.content.maxJobsPerCompany}
                      onChange={(value) => handleSettingChange('content', 'maxJobsPerCompany', parseInt(value))}
                      placeholder="50"
                      min="1"
                      max="1000"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>User Features</h4>
                    
                    <ToggleSwitch
                      checked={settings.content.enableUserReviews}
                      onChange={(value) => handleSettingChange('content', 'enableUserReviews', value)}
                      label="Enable User Reviews"
                      description="Allow users to review companies"
                    />
                    
                    <ToggleSwitch
                      checked={settings.content.moderateUserReviews}
                      onChange={(value) => handleSettingChange('content', 'moderateUserReviews', value)}
                      label="Moderate User Reviews"
                      description="Require admin approval for reviews"
                    />
                    
                    <ToggleSwitch
                      checked={settings.content.allowAnonymousApplications}
                      onChange={(value) => handleSettingChange('content', 'allowAnonymousApplications', value)}
                      label="Allow Anonymous Applications"
                      description="Users can apply without revealing identity initially"
                    />
                    
                    <ToggleSwitch
                      checked={settings.content.enableJobAlerts}
                      onChange={(value) => handleSettingChange('content', 'enableJobAlerts', value)}
                      label="Enable Job Alerts"
                      description="Users can set up email alerts for jobs"
                    />
                    
                    <InputField
                      type="number"
                      label="Max Job Alerts per User"
                      value={settings.content.maxJobAlertsPerUser}
                      onChange={(value) => handleSettingChange('content', 'maxJobAlertsPerUser', parseInt(value))}
                      placeholder="10"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Communications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Communications & Notifications
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Notification Channels</h4>
                    
                    <ToggleSwitch
                      checked={settings.notifications.enableEmailNotifications}
                      onChange={(value) => handleSettingChange('notifications', 'enableEmailNotifications', value)}
                      label="Email Notifications"
                      description="Send notifications via email"
                    />
                    
                    <ToggleSwitch
                      checked={settings.notifications.enablePushNotifications}
                      onChange={(value) => handleSettingChange('notifications', 'enablePushNotifications', value)}
                      label="Push Notifications"
                      description="Send browser/app push notifications"
                    />
                    
                    <ToggleSwitch
                      checked={settings.notifications.enableSMSNotifications}
                      onChange={(value) => handleSettingChange('notifications', 'enableSMSNotifications', value)}
                      label="SMS Notifications"
                      description="Send notifications via SMS"
                    />
                    
                    <InputField
                      label="Email From Name"
                      value={settings.notifications.emailFromName}
                      onChange={(value) => handleSettingChange('notifications', 'emailFromName', value)}
                      placeholder="JobPortal Admin"
                    />
                    
                    <InputField
                      type="email"
                      label="Email From Address"
                      value={settings.notifications.emailFromAddress}
                      onChange={(value) => handleSettingChange('notifications', 'emailFromAddress', value)}
                      placeholder="admin@jobportal.com"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Admin Notifications</h4>
                    
                    <ToggleSwitch
                      checked={settings.notifications.notifyAdminNewJob}
                      onChange={(value) => handleSettingChange('notifications', 'notifyAdminNewJob', value)}
                      label="New Job Notifications"
                      description="Notify admin when new jobs are posted"
                    />
                    
                    <ToggleSwitch
                      checked={settings.notifications.notifyAdminNewUser}
                      onChange={(value) => handleSettingChange('notifications', 'notifyAdminNewUser', value)}
                      label="New User Notifications"
                      description="Notify admin when new users register"
                    />
                    
                    <ToggleSwitch
                      checked={settings.notifications.notifyAdminPayments}
                      onChange={(value) => handleSettingChange('notifications', 'notifyAdminPayments', value)}
                      label="Payment Notifications"
                      description="Notify admin of payment transactions"
                    />
                    
                    <ToggleSwitch
                      checked={settings.notifications.enableChatSupport}
                      onChange={(value) => handleSettingChange('notifications', 'enableChatSupport', value)}
                      label="Chat Support"
                      description="Enable live chat support feature"
                    />
                    
                    <ToggleSwitch
                      checked={settings.notifications.autoResponseEnabled}
                      onChange={(value) => handleSettingChange('notifications', 'autoResponseEnabled', value)}
                      label="Auto-Response"
                      description="Send automatic responses to inquiries"
                    />
                    
                    <InputField
                      label="Support Hours"
                      value={settings.notifications.supportHours}
                      onChange={(value) => handleSettingChange('notifications', 'supportHours', value)}
                      placeholder="9 AM - 6 PM UTC"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Security Configuration
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Password & Authentication</h4>
                    
                    <ToggleSwitch
                      checked={settings.security.enforceStrongPasswords}
                      onChange={(value) => handleSettingChange('security', 'enforceStrongPasswords', value)}
                      label="Enforce Strong Passwords"
                      description="Require strong passwords with complexity rules"
                    />
                    
                    <ToggleSwitch
                      checked={settings.security.enableAccountLockout}
                      onChange={(value) => handleSettingChange('security', 'enableAccountLockout', value)}
                      label="Enable Account Lockout"
                      description="Lock accounts after failed login attempts"
                    />
                    
                    <InputField
                      type="number"
                      label="Max Login Attempts"
                      value={settings.security.maxLoginAttempts}
                      onChange={(value) => handleSettingChange('security', 'maxLoginAttempts', parseInt(value))}
                      placeholder="5"
                      min="1"
                      max="10"
                    />
                    
                    <InputField
                      type="number"
                      label="Lockout Duration (minutes)"
                      value={settings.security.lockoutDurationMinutes}
                      onChange={(value) => handleSettingChange('security', 'lockoutDurationMinutes', parseInt(value))}
                      placeholder="30"
                      min="1"
                      max="1440"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Security Features</h4>
                    
                    <ToggleSwitch
                      checked={settings.security.enableIPWhitelist}
                      onChange={(value) => handleSettingChange('security', 'enableIPWhitelist', value)}
                      label="IP Whitelist"
                      description="Restrict access to whitelisted IP addresses"
                    />
                    
                    <ToggleSwitch
                      checked={settings.security.enableAuditLogging}
                      onChange={(value) => handleSettingChange('security', 'enableAuditLogging', value)}
                      label="Audit Logging"
                      description="Log all user actions for security audits"
                    />
                    
                    <ToggleSwitch
                      checked={settings.security.requireHTTPS}
                      onChange={(value) => handleSettingChange('security', 'requireHTTPS', value)}
                      label="Require HTTPS"
                      description="Force HTTPS for all connections"
                    />
                    
                    <ToggleSwitch
                      checked={settings.security.enableCSRFProtection}
                      onChange={(value) => handleSettingChange('security', 'enableCSRFProtection', value)}
                      label="CSRF Protection"
                      description="Enable Cross-Site Request Forgery protection"
                    />
                    
                    <ToggleSwitch
                      checked={settings.security.cookieSecureFlag}
                      onChange={(value) => handleSettingChange('security', 'cookieSecureFlag', value)}
                      label="Secure Cookies"
                      description="Set secure flag on all cookies"
                    />
                    
                    <ToggleSwitch
                      checked={settings.security.sessionCookieHttpOnly}
                      onChange={(value) => handleSettingChange('security', 'sessionCookieHttpOnly', value)}
                      label="HttpOnly Session Cookies"
                      description="Prevent JavaScript access to session cookies"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={() => setShowResetModal(false)} />
            
            <div 
              className="relative inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl"
              style={{ backgroundColor: 'var(--background-panel)' }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  Reset Settings
                </h3>
              </div>
              
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to reset all settings to their default values? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetModal(false)}
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
                  onClick={handleResetSettings}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 text-white bg-red-600 hover:bg-red-700"
                >
                  Reset Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}