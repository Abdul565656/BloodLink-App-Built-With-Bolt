import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  MessageSquare, 
  Building2, 
  Share2, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Mail,
  MapPin,
  Phone,
  Globe,
  Twitter,
  Linkedin,
  Send,
  Sparkles,
  Star,
  Zap,
  Shield,
  Target,
  Award,
  HandHeart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notificationAgent } from '../lib/notificationAgent';

interface VolunteerFormData {
  name: string;
  email: string;
  region: string;
  motivation: string;
}

interface PartnerFormData {
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  organizationType: string;
  message: string;
}

export default function GetInvolvedPage() {
  // Volunteer form state
  const [volunteerForm, setVolunteerForm] = useState<VolunteerFormData>({
    name: '',
    email: '',
    region: '',
    motivation: ''
  });
  const [volunteerSubmitting, setVolunteerSubmitting] = useState(false);
  const [volunteerStatus, setVolunteerStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [volunteerMessage, setVolunteerMessage] = useState('');

  // Partner form state
  const [partnerForm, setPartnerForm] = useState<PartnerFormData>({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    organizationType: '',
    message: ''
  });
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [partnerMessage, setPartnerMessage] = useState('');

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVolunteerSubmitting(true);
    setVolunteerStatus('idle');
    
    try {
      console.log('🔄 Submitting volunteer application:', volunteerForm);

      // Save to Supabase
      const { data, error } = await supabase
        .from('volunteers')
        .insert([{
          name: volunteerForm.name.trim(),
          email: volunteerForm.email.trim(),
          region: volunteerForm.region.trim(),
          motivation: volunteerForm.motivation.trim() || null,
          status: 'pending'
        }])
        .select();

      if (error) {
        console.error('❌ Error saving volunteer application:', error);
        throw error;
      }

      console.log('✅ Volunteer application saved successfully:', data);

      // Trigger notifications
      await notificationAgent.processTrigger({
        event: 'volunteer_registered',
        data: {
          name: volunteerForm.name,
          email: volunteerForm.email,
          region: volunteerForm.region,
          motivation: volunteerForm.motivation
        }
      });

      setVolunteerStatus('success');
      setVolunteerMessage("🎉 Welcome to the team! We'll contact you soon with next steps and volunteer opportunities in your area.");
      
      // Reset form
      setVolunteerForm({
        name: '',
        email: '',
        region: '',
        motivation: ''
      });

    } catch (error: any) {
      console.error('❌ Error submitting volunteer application:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'This email is already registered as a volunteer.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Database connection error. Please check your configuration.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setVolunteerStatus('error');
      setVolunteerMessage(errorMessage);
    } finally {
      setVolunteerSubmitting(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerSubmitting(true);
    setPartnerStatus('idle');
    
    try {
      console.log('🔄 Submitting partnership inquiry:', partnerForm);

      // Save to Supabase
      const { data, error } = await supabase
        .from('partnerships')
        .insert([{
          organization_name: partnerForm.organizationName.trim(),
          contact_name: partnerForm.contactName.trim(),
          email: partnerForm.email.trim(),
          phone: partnerForm.phone.trim(),
          organization_type: partnerForm.organizationType,
          message: partnerForm.message.trim(),
          status: 'pending'
        }])
        .select();

      if (error) {
        console.error('❌ Error saving partnership inquiry:', error);
        throw error;
      }

      console.log('✅ Partnership inquiry saved successfully:', data);

      // Trigger notifications
      await notificationAgent.processTrigger({
        event: 'partnership_inquiry',
        data: {
          organizationName: partnerForm.organizationName,
          contactName: partnerForm.contactName,
          email: partnerForm.email,
          phone: partnerForm.phone,
          organizationType: partnerForm.organizationType,
          message: partnerForm.message
        }
      });

      setPartnerStatus('success');
      setPartnerMessage("🤝 Thank you for your interest! Our partnership team will contact you within 24 hours to discuss collaboration opportunities.");
      
      // Reset form
      setPartnerForm({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        organizationType: '',
        message: ''
      });

    } catch (error: any) {
      console.error('❌ Error submitting partnership inquiry:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'A partnership inquiry from this organization already exists.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Database connection error. Please check your configuration.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setPartnerStatus('error');
      setPartnerMessage(errorMessage);
    } finally {
      setPartnerSubmitting(false);
    }
  };

  const shareOnTwitter = () => {
    const text = "Join me in saving lives! 🩸 BloodLink connects blood donors with those in need worldwide. Every voice matters in building a global community of life-savers! #BloodLink #SaveLives #BloodDonation";
    const url = window.location.origin;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const title = "BloodLink - Saving Lives Through Global Blood Donation Network";
    const summary = "Join the movement to save lives worldwide. BloodLink uses AI to connect blood donors with patients in need. Every voice matters in building a community of heroes.";
    const url = window.location.origin;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = "🩸 Join BloodLink - the global blood donation network that's saving lives worldwide! Every voice matters in building a community of heroes. Check it out:";
    const url = window.location.origin;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const joinWhatsAppGroup = () => {
    // In a real app, this would be a real WhatsApp group link
    const message = "Hi! I'd like to join the BloodLink donor WhatsApp group to stay connected with the community and receive updates about blood donation opportunities.";
    window.open(`https://wa.me/1234567890?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">BloodLink</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/donate"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Become Donor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full shadow-lg animate-pulse">
              <HandHeart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Get Involved &
            <span className="block bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Save Lives Together
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Every voice matters. Every action counts. Join our global community of heroes 
            and help us build a world where no one dies waiting for blood.
          </p>
          
          {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="text-3xl font-bold text-red-600 mb-2">50K+</div>
              <div className="text-gray-700 font-medium">Community Members</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="text-3xl font-bold text-red-600 mb-2">200+</div>
              <div className="text-gray-700 font-medium">Partner Hospitals</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="text-3xl font-bold text-red-600 mb-2">95%</div>
              <div className="text-gray-700 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column */}
          <div className="space-y-12">
            
            {/* 1. Become a Volunteer */}
            <section className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 animate-in fade-in-0 slide-in-from-left-4 duration-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Become a Volunteer</h2>
                  <p className="text-blue-600 font-medium">Join our mission to save lives ✨</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Help us spread awareness, organize blood drives, and support our community. 
                Every volunteer makes a difference in saving lives worldwide.
              </p>

              {/* Volunteer Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-700">Recognition & Certificates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-700">Skill Development</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">Community Impact</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-gray-700">Leadership Opportunities</span>
                </div>
              </div>

              {/* Status Messages */}
              {volunteerStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-800">{volunteerMessage}</p>
                </div>
              )}

              {volunteerStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800">{volunteerMessage}</p>
                </div>
              )}

              {/* Volunteer Form */}
              <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={volunteerForm.name}
                    onChange={(e) => setVolunteerForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={volunteerForm.email}
                    onChange={(e) => setVolunteerForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Your region/city"
                    value={volunteerForm.region}
                    onChange={(e) => setVolunteerForm(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="What motivates you to volunteer? (optional)"
                    value={volunteerForm.motivation}
                    onChange={(e) => setVolunteerForm(prev => ({ ...prev, motivation: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={volunteerSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  {volunteerSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Joining the team...</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-5 w-5" />
                      <span>Join as Volunteer</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* 2. Join WhatsApp Group */}
            <section className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 animate-in fade-in-0 slide-in-from-left-6 duration-700 delay-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full shadow-lg">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Join Our WhatsApp Group</h2>
                  <p className="text-green-600 font-medium">Stay connected with the community 💬</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Connect with fellow donors, get instant updates about urgent blood needs, 
                and be part of our supportive community that's changing lives every day.
              </p>

              {/* WhatsApp Group Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Instant emergency alerts</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Connect with local donors</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Heart className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Share success stories</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Get donation reminders</span>
                </div>
              </div>

              <button
                onClick={joinWhatsAppGroup}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-6 w-6" />
                <span>Join WhatsApp Group</span>
                <Sparkles className="h-5 w-5" />
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                🔒 Your privacy is protected. Group guidelines ensure respectful communication.
              </p>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-12">
            
            {/* 3. Partner with Us */}
            <section className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Partner with Us</h2>
                  <p className="text-purple-600 font-medium">Hospitals & Organizations 🏥</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Join our network of healthcare partners. Together, we can create a more 
                efficient and life-saving blood donation ecosystem.
              </p>

              {/* Partnership Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-700">Global Network Access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-700">AI-Powered Matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">Verified Donors</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-gray-700">24/7 Support</span>
                </div>
              </div>

              {/* Status Messages */}
              {partnerStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-800">{partnerMessage}</p>
                </div>
              )}

              {partnerStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800">{partnerMessage}</p>
                </div>
              )}

              {/* Partner Form */}
              <form onSubmit={handlePartnerSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Organization name"
                    value={partnerForm.organizationName}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, organizationName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Contact person name"
                    value={partnerForm.contactName}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, contactName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={partnerForm.phone}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <select
                    value={partnerForm.organizationType}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, organizationType: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  >
                    <option value="">Select organization type</option>
                    <option value="hospital">Hospital</option>
                    <option value="blood-bank">Blood Bank</option>
                    <option value="clinic">Clinic</option>
                    <option value="ngo">NGO</option>
                    <option value="government">Government Agency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <textarea
                    placeholder="Tell us about your organization and partnership goals"
                    value={partnerForm.message}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={partnerSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  {partnerSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Submitting inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="h-5 w-5" />
                      <span>Start Partnership</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* 4. Social Share */}
            <section className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 animate-in fade-in-0 slide-in-from-right-6 duration-700 delay-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 rounded-full shadow-lg">
                  <Share2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Social Share</h2>
                  <p className="text-pink-600 font-medium">Save lives with a click 📱</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Spread the word about BloodLink! Every share could reach someone who needs blood 
                or someone willing to donate. Your voice can save lives.
              </p>

              {/* Share Impact */}
              <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-6 mb-8 border border-pink-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-pink-600" />
                  <span>Your Share Impact</span>
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-pink-600">1K+</div>
                    <div className="text-sm text-gray-700">Potential Reach</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-600">50+</div>
                    <div className="text-sm text-gray-700">New Donors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-600">3</div>
                    <div className="text-sm text-gray-700">Lives Saved</div>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-4">
                <button
                  onClick={shareOnTwitter}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  <Twitter className="h-6 w-6" />
                  <span>Share on Twitter</span>
                  <span className="text-blue-200 text-sm">#SaveLives</span>
                </button>
                
                <button
                  onClick={shareOnLinkedIn}
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-800 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-900 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  <Linkedin className="h-6 w-6" />
                  <span>Share on LinkedIn</span>
                  <span className="text-blue-200 text-sm">Professional</span>
                </button>
                
                <button
                  onClick={shareOnWhatsApp}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  <Send className="h-6 w-6" />
                  <span>Share on WhatsApp</span>
                  <span className="text-green-200 text-sm">Personal</span>
                </button>
              </div>

              {/* Share Stats */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>🔥 Trending: #BloodLink</span>
                  <span>📈 +25% shares this week</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <section className="mt-20 bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-12 text-center text-white animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-500">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            Every voice matters. Every action counts. Join thousands of heroes worldwide 
            who are making a difference in the fight to save lives.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/donate"
              className="bg-white text-red-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Heart className="h-6 w-6" />
              <span>Become a Donor</span>
            </Link>
            
            <Link
              to="/request"
              className="bg-red-800 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-red-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Users className="h-6 w-6" />
              <span>Request Blood</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}