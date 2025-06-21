import React, { useState } from 'react';
import { Heart, User, Droplets, MapPin, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { notificationAgent } from '../lib/notificationAgent';
import LocationSelector from './LocationSelector';
import DonorMatchDisplay from './DonorMatchDisplay';
import type { BloodRequest } from '../lib/donorMatcher';

interface FormData {
  patientName: string;
  bloodGroup: string;
  country: string;
  city: string;
}

interface FormErrors {
  patientName?: string;
  bloodGroup?: string;
  country?: string;
  city?: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    patientName: '',
    bloodGroup: '',
    country: '',
    city: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [showDonorMatches, setShowDonorMatches] = useState(false);
  const [currentBloodRequest, setCurrentBloodRequest] = useState<BloodRequest | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Patient Name validation
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    } else if (formData.patientName.trim().length < 2) {
      newErrors.patientName = 'Patient name must be at least 2 characters';
    }

    // Blood Group validation
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }

    // City validation
    if (!formData.city) {
      newErrors.city = 'Please select your city';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      bloodGroup: '',
      country: '',
      city: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Generate default values for required fields
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const bloodRequestData = {
        patient_name: formData.patientName.trim(),
        blood_group: formData.bloodGroup,
        hospital_name: 'General Hospital', // Default value
        country: formData.country,
        city: formData.city,
        contact_number: '+1234567890', // Default value - will be updated in real implementation
        reason: null,
        urgency_level: 'medium', // Default to medium priority
        preferred_date: tomorrow.toISOString().split('T')[0],
        preferred_time: '10:00',
        status: 'pending'
      };

      console.log('Submitting simplified blood request:', bloodRequestData);

      const { data, error } = await supabase
        .from('blood_requests')
        .insert([bloodRequestData])
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Blood request submitted successfully:', data);

      // Trigger notifications
      await notificationAgent.processTrigger({
        event: 'blood_request_submitted',
        data: bloodRequestData
      });

      // Create blood request object for donor matching
      const bloodRequest: BloodRequest = {
        patient_name: formData.patientName.trim(),
        blood_group: formData.bloodGroup,
        country: formData.country,
        city: formData.city,
        urgency_level: 'medium',
        hospital_name: 'General Hospital',
        contact_number: '+1234567890',
        preferred_date: tomorrow.toISOString().split('T')[0],
        preferred_time: '10:00'
      };

      setCurrentBloodRequest(bloodRequest);
      setSubmitStatus('success');
      setSubmitMessage("✅ Request submitted! AI is finding matching donors...");
      
      // Show donor matches after a brief delay
      setTimeout(() => {
        setShowDonorMatches(true);
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting blood request:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.message) {
        if (error.message.includes('404')) {
          errorMessage = 'Database connection error. Please check your configuration.';
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

  const handleCloseDonorMatches = () => {
    setShowDonorMatches(false);
    setCurrentBloodRequest(null);
    setSubmitStatus('idle');
    setSubmitMessage('');
    resetForm();
  };

  // Show donor matches if available
  if (showDonorMatches && currentBloodRequest) {
    return <DonorMatchDisplay bloodRequest={currentBloodRequest} onClose={handleCloseDonorMatches} />;
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
            Request Blood Instantly
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Simple 3-step process. Our AI will find matching donors in your area immediately.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{submitMessage}</p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{submitMessage}</p>
          </div>
        )}

        {/* Simplified Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="text-sm font-medium text-gray-700">Patient Info</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-sm font-medium text-gray-700">Blood Type</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-sm font-medium text-gray-700">Location</span>
            </div>
          </div>

          {/* Patient Name */}
          <div>
            <label htmlFor="patientName" className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Patient Name *
            </label>
            <input
              type="text"
              id="patientName"
              value={formData.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.patientName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter patient's full name"
            />
            {errors.patientName && (
              <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>
            )}
          </div>

          {/* Blood Group */}
          <div>
            <label htmlFor="bloodGroup" className="block text-sm font-semibold text-gray-700 mb-2">
              <Droplets className="h-4 w-4 inline mr-2" />
              Blood Group Needed *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {BLOOD_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => handleInputChange('bloodGroup', group)}
                  className={`p-3 rounded-xl border-2 font-semibold transition-all duration-200 ${
                    formData.bloodGroup === group
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
            {errors.bloodGroup && (
              <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>
            )}
          </div>

          {/* Location Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Location *
            </label>
            <LocationSelector
              selectedCountry={formData.country}
              selectedCity={formData.city}
              onCountryChange={(country) => handleInputChange('country', country)}
              onCityChange={(city) => handleInputChange('city', city)}
              errors={{ country: errors.country, city: errors.city }}
              required
            />
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
                <span>Finding Donors with AI...</span>
              </>
            ) : (
              <>
                <Heart className="h-5 w-5" />
                <span>Find Donors Instantly</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 leading-relaxed">
            🤖 Our AI will instantly search our global database and find the best matching donors in your area.
          </p>
        </div>
      </div>
    </div>
  );
}