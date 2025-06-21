import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Phone, Check, X, Settings } from 'lucide-react';

interface NotificationPreferences {
  bloodRequestConfirmation: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  donorMatchFound: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  donationReminder: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  appointmentReminder: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bloodRequestConfirmation: { email: true, sms: true, whatsapp: false },
    donorMatchFound: { email: true, sms: true, whatsapp: true },
    donationReminder: { email: true, sms: false, whatsapp: false },
    appointmentReminder: { email: true, sms: true, whatsapp: true }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const notificationTypes = [
    {
      key: 'bloodRequestConfirmation' as keyof NotificationPreferences,
      title: 'Blood Request Confirmation',
      description: 'When your blood request is successfully submitted'
    },
    {
      key: 'donorMatchFound' as keyof NotificationPreferences,
      title: 'Donor Match Found',
      description: 'When we find matching donors for your request'
    },
    {
      key: 'donationReminder' as keyof NotificationPreferences,
      title: 'Donation Reminder',
      description: 'When you\'re eligible to donate blood again'
    },
    {
      key: 'appointmentReminder' as keyof NotificationPreferences,
      title: 'Appointment Reminder',
      description: '24 hours before your donation appointment'
    }
  ];

  const channels = [
    { key: 'email', label: 'Email', icon: Mail, color: 'text-blue-600' },
    { key: 'sms', label: 'SMS', icon: MessageSquare, color: 'text-green-600' },
    { key: 'whatsapp', label: 'WhatsApp', icon: Phone, color: 'text-emerald-600' }
  ];

  const handleToggle = (notificationType: keyof NotificationPreferences, channel: string) => {
    setPreferences(prev => ({
      ...prev,
      [notificationType]: {
        ...prev[notificationType],
        [channel]: !prev[notificationType][channel as keyof typeof prev[notificationType]]
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, save to Supabase or user preferences
      localStorage.setItem('notification_preferences', JSON.stringify(preferences));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-blue-100 p-3 rounded-full">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-gray-600">Choose how you want to receive notifications</p>
        </div>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-green-800">Notification preferences saved successfully!</p>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <X className="h-5 w-5 text-red-600" />
          <p className="text-red-800">Failed to save preferences. Please try again.</p>
        </div>
      )}

      {/* Notification Types */}
      <div className="space-y-8">
        {notificationTypes.map((type) => (
          <div key={type.key} className="border border-gray-200 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
              <p className="text-gray-600 text-sm">{type.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const isEnabled = preferences[type.key][channel.key as keyof typeof preferences[typeof type.key]];

                return (
                  <div
                    key={channel.key}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      isEnabled
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => handleToggle(type.key, channel.key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${isEnabled ? 'text-blue-900' : 'text-gray-600'}`}>
                          {channel.label}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isEnabled
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {isEnabled && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Global Settings */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Global Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Emergency Alerts</p>
              <p className="text-sm text-gray-600">Receive urgent notifications for critical blood shortages</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emergency-alerts"
                defaultChecked
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="emergency-alerts" className="text-sm text-gray-700">Enable</label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Quiet Hours</p>
              <p className="text-sm text-gray-600">No notifications between 10 PM and 7 AM</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="quiet-hours"
                defaultChecked
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="quiet-hours" className="text-sm text-gray-700">Enable</label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Stay Connected, Save Lives</p>
            <p className="text-sm text-blue-700 mt-1">
              Notifications help us connect you with life-saving opportunities quickly. 
              You can always update these preferences later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}