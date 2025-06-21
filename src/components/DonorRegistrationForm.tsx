import React, { useState, useRef } from 'react';
import { Heart, User, Phone, Droplets, Calendar, CheckCircle, AlertCircle, Loader2, ArrowLeft, Star, Trophy, Shield, Home, Users, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { notificationAgent } from '../lib/notificationAgent';
import LocationSelector from './LocationSelector';

interface FormData {
  fullName: string;
  phoneNumber: string;
  country: string;
  city: string;
  bloodGroup: string;
  lastDonationDate: string;
  isAvailable: boolean;
}

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  bloodGroup?: string;
  lastDonationDate?: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorRegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    country: '',
    city: '',
    bloodGroup: '',
    lastDonationDate: '',
    isAvailable: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Phone Number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }

    // City validation
    if (!formData.city) {
      newErrors.city = 'Please select your city';
    }

    // Blood Group validation
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Please select your blood group';
    }

    // Last Donation Date validation (optional but if provided, should be valid)
    if (formData.lastDonationDate) {
      const donationDate = new Date(formData.lastDonationDate);
      const today = new Date();
      if (donationDate > today) {
        newErrors.lastDonationDate = 'Last donation date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      country: '',
      city: '',
      bloodGroup: '',
      lastDonationDate: '',
      isAvailable: true,
    });
    setErrors({});
  };

  const playThankYouMessage = () => {
    // Check if voice is enabled and Web Speech API is available
    if (!voiceEnabled || !('speechSynthesis' in window)) {
      return;
    }

    try {
      setIsPlayingVoice(true);
      
      // Stop any currently playing speech
      speechSynthesis.cancel();
      
      const thankYouText = `Thank you ${formData.fullName} for registering as a blood donor. You're now part of a life-saving community that spans the globe. Your ${formData.bloodGroup} blood type can help save up to three lives with each donation. BloodLink appreciates your generosity and commitment to helping others. Welcome to our family of heroes.`;

      const utterance = new SpeechSynthesisUtterance(thankYouText);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      // Try to use a more natural voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Daniel')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsPlayingVoice(false);
      };

      utterance.onerror = () => {
        setIsPlayingVoice(false);
      };

      speechSynthesis.speak(utterance);
      console.log('🎤 Thank you voice message played successfully');
    } catch (error) {
      console.error('❌ Voice synthesis failed:', error);
      setIsPlayingVoice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const donorData = {
        full_name: formData.fullName.trim(),
        phone_number: formData.phoneNumber.trim(),
        country: formData.country,
        city: formData.city,
        blood_group: formData.bloodGroup,
        last_donation_date: formData.lastDonationDate || null,
        is_available: formData.isAvailable,
      };

      console.log('Submitting donor data:', donorData);

      const { data, error } = await supabase
        .from('donors')
        .insert([donorData])
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Insert successful:', data);

      // Trigger notifications
      await notificationAgent.processTrigger({
        event: 'donor_registered',
        data: donorData
      });

      setSubmitStatus('success');
      setSubmitMessage("🎉 Welcome to BloodLink! You're now part of our global life-saving network.");

      // Play thank you voice message
      setTimeout(() => {
        playThankYouMessage();
      }, 1000);

    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.message) {
        if (error.message.includes('404')) {
          errorMessage = 'Database connection error. Please check your Supabase configuration.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Permission denied. Please check your database permissions.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSubmitStatus('error');
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVoice = () => {
    const newVoiceState = !voiceEnabled;
    setVoiceEnabled(newVoiceState);
    
    if (!newVoiceState) {
      // If disabling voice, stop current speech immediately
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      setIsPlayingVoice(false);
      console.log('🔇 Voice disabled, speech stopped');
    } else {
      console.log('🔊 Voice enabled');
    }
  };

  // Success Screen - FIXED: No auto-close, stays visible until user navigates away
  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            {/* Voice Control */}
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleVoice}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  voiceEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={voiceEnabled ? "Disable voice" : "Enable voice"}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-sm">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                {isPlayingVoice && <Loader2 className="h-4 w-4 animate-spin" />}
              </button>
            </div>

            {/* Success Animation */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-full inline-block">
                <Trophy className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              🎉 Welcome to BloodLink!
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              You're now part of our global network of life-savers! Your {formData.bloodGroup} blood 
              can help save up to 3 lives per donation.
            </p>

            {/* Voice Message Indicator */}
            {voiceEnabled && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-center space-x-2">
                  {isPlayingVoice ? (
                    <>
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      <span className="text-blue-800 font-medium">Playing welcome message...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">Voice welcome message available</span>
                      <button
                        onClick={playThankYouMessage}
                        className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Play Again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Donor Badge */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="bg-red-600 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-red-700">Global Blood Donor</h3>
                  <p className="text-red-600 text-sm">BloodLink Verified</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-semibold">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Blood Group:</span>
                  <span className="font-semibold">{formData.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-semibold">{formData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-green-600">✓ Active</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-900 mb-2">Verified Network</h4>
                <p className="text-blue-700 text-sm">You're now part of our secure, verified donor network</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <Star className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-green-900 mb-2">Life Saver</h4>
                <p className="text-green-700 text-sm">Each donation can save up to 3 precious lives</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <Heart className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-purple-900 mb-2">Global Impact</h4>
                <p className="text-purple-700 text-sm">Connect with patients worldwide who need your help</p>
              </div>
            </div>

            {/* Action Buttons - FIXED: Manual navigation only */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              <Link
                to="/admin"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Users className="h-5 w-5" />
                <span>View All Donors</span>
              </Link>
              <button
                onClick={() => {
                  setSubmitStatus('idle');
                  resetForm();
                }}
                className="bg-white text-red-600 border-2 border-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-red-600 hover:text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Register Another Donor
              </button>
            </div>

            {/* Footer Note */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600">
                💡 <strong>What's Next?</strong> You'll receive notifications when blood is needed in your area. 
                Keep your phone handy - you might be someone's hero today!
                {voiceEnabled && " 🎤 Voice messages will help guide you through the process."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 py-12 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full shadow-lg">
              <Heart className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Become a Global Blood Donor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join our worldwide community of life-savers. Your donation can save up to 3 lives.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        {/* Status Messages */}
        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{submitMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your phone number with country code"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Location Selector */}
          <LocationSelector
            selectedCountry={formData.country}
            selectedCity={formData.city}
            onCountryChange={(country) => handleInputChange('country', country)}
            onCityChange={(city) => handleInputChange('city', city)}
            errors={{ country: errors.country, city: errors.city }}
            required
          />

          {/* Blood Group */}
          <div>
            <label htmlFor="bloodGroup" className="block text-sm font-semibold text-gray-700 mb-2">
              <Droplets className="h-4 w-4 inline mr-2" />
              Blood Group *
            </label>
            <select
              id="bloodGroup"
              value={formData.bloodGroup}
              onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.bloodGroup ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select your blood group</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            {errors.bloodGroup && (
              <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>
            )}
          </div>

          {/* Last Donation Date */}
          <div>
            <label htmlFor="lastDonationDate" className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Last Donation Date (Optional)
            </label>
            <input
              type="date"
              id="lastDonationDate"
              value={formData.lastDonationDate}
              onChange={(e) => handleInputChange('lastDonationDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.lastDonationDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.lastDonationDate && (
              <p className="mt-1 text-sm text-red-600">{errors.lastDonationDate}</p>
            )}
          </div>

          {/* Availability Toggle */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="isAvailable" className="text-sm font-semibold text-gray-700 flex-1">
                I am available to donate blood and receive notifications
              </label>
              <CheckCircle className={`h-5 w-5 ${formData.isAvailable ? 'text-green-500' : 'text-gray-300'}`} />
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-8">
              You can change this anytime. We'll only contact you when there's a matching blood request.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Joining Global Network...</span>
              </>
            ) : (
              <>
                <Heart className="h-5 w-5" />
                <span>Join as Global Donor</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 leading-relaxed">
            By registering, you agree to be contacted via SMS and email when blood donations are needed in your area.
            Your information will be shared with verified blood banks and hospitals worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}