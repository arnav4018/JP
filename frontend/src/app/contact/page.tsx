'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  HelpCircle,
  Briefcase,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'hello@jobportal.com',
    description: 'Send us an email anytime'
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+1 (555) 123-4567',
    description: 'Mon-Fri from 8am to 6pm'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: '123 Business Street, Suite 100',
    description: 'San Francisco, CA 94105'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    value: 'Mon-Fri: 8am-6pm PST',
    description: 'Weekend support available'
  }
];

const supportOptions = [
  {
    icon: HelpCircle,
    title: 'General Support',
    description: 'Get help with your account, technical issues, or general questions',
    email: 'support@jobportal.com'
  },
  {
    icon: Briefcase,
    title: 'For Employers',
    description: 'Questions about posting jobs, managing candidates, or premium features',
    email: 'employers@jobportal.com'
  },
  {
    icon: Users,
    title: 'For Job Seekers',
    description: 'Help with job search, profile optimization, or application process',
    email: 'candidates@jobportal.com'
  },
  {
    icon: MessageSquare,
    title: 'Business Inquiries',
    description: 'Partnership opportunities, press inquiries, or business development',
    email: 'business@jobportal.com'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you'd make an actual API call here
      console.log('Contact form submitted:', formData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
        {/* Hero Section */}
        <div className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Get in Touch
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
              We're here to help! Whether you have questions, need support, or want to share feedback, 
              our team is ready to assist you.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {contactInfo.map((info, index) => (
                <div key={index} className="text-center p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ backgroundColor: 'var(--background-panel)', border: '1px solid var(--accent-subtle)' }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                    <info.icon className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {info.title}
                  </h3>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--accent-interactive)' }}>
                    {info.value}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Send us a Message
                </h2>
                <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{ 
                          borderColor: 'var(--accent-subtle)', 
                          backgroundColor: 'var(--background-panel)', 
                          color: 'var(--text-primary)' 
                        }}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{ 
                          borderColor: 'var(--accent-subtle)', 
                          backgroundColor: 'var(--background-panel)', 
                          color: 'var(--text-primary)' 
                        }}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--accent-subtle)', 
                        backgroundColor: 'var(--background-panel)', 
                        color: 'var(--text-primary)' 
                      }}
                    >
                      <option value="general">General Support</option>
                      <option value="employers">For Employers</option>
                      <option value="jobseekers">For Job Seekers</option>
                      <option value="business">Business Inquiries</option>
                      <option value="technical">Technical Issues</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        borderColor: 'var(--accent-subtle)', 
                        backgroundColor: 'var(--background-panel)', 
                        color: 'var(--text-primary)' 
                      }}
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-y"
                      style={{ 
                        borderColor: 'var(--accent-subtle)', 
                        backgroundColor: 'var(--background-panel)', 
                        color: 'var(--text-primary)' 
                      }}
                      placeholder="Please describe your question or issue in detail..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: 'var(--accent-interactive)', 
                      color: 'var(--background-deep)' 
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="flex items-center space-x-2 p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                      <CheckCircle className="h-5 w-5" />
                      <span>Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="flex items-center space-x-2 p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <AlertCircle className="h-5 w-5" />
                      <span>Sorry, there was an error sending your message. Please try again or contact us directly.</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Support Options */}
              <div>
                <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  How Can We Help?
                </h2>
                <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Choose the most relevant option for faster assistance.
                </p>

                <div className="space-y-6">
                  {supportOptions.map((option, index) => (
                    <div key={index} className="p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: 'var(--background-panel)', border: '1px solid var(--accent-subtle)' }}>
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                          <option.icon className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            {option.title}
                          </h3>
                          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            {option.description}
                          </p>
                          <a 
                            href={`mailto:${option.email}`}
                            className="inline-flex items-center space-x-2 text-sm font-medium transition-opacity hover:opacity-80"
                            style={{ color: 'var(--accent-interactive)' }}
                          >
                            <Mail className="h-4 w-4" />
                            <span>{option.email}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FAQ Link */}
                <div className="mt-12 p-6 rounded-xl text-center" style={{ backgroundColor: 'var(--background-panel)', border: '1px solid var(--accent-subtle)' }}>
                  <HelpCircle className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--accent-interactive)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Frequently Asked Questions
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Find quick answers to common questions about using JobPortal.
                  </p>
                  <button
                    className="px-6 py-2 rounded-lg border font-medium transition-all duration-300 hover:opacity-80"
                    style={{ 
                      borderColor: 'var(--accent-interactive)', 
                      color: 'var(--accent-interactive)' 
                    }}
                  >
                    View FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section (Placeholder) */}
        <div className="py-16 px-6" style={{ backgroundColor: 'var(--background-panel)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Our Location
              </h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Visit our office in the heart of San Francisco
              </p>
            </div>
            
            {/* Map Placeholder */}
            <div className="w-full h-96 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <div className="text-center">
                <MapPin className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--accent-interactive)' }} />
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Interactive Map Coming Soon
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  123 Business Street, Suite 100<br />
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}