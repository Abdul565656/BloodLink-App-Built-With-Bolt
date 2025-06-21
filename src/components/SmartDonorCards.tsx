import React, { useState, useEffect } from 'react';
import { Users, Phone, MessageSquare, MapPin, Droplets, Clock, CheckCircle, X, Filter, Search, Star, Heart, Shield, Globe, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCountryByCode } from '../lib/locationData';

interface Donor {
  id: string;
  full_name: string;
  phone_number: string;
  city: string;
  country: string;
  blood_group: string;
  last_donation_date: string | null;
  is_available: boolean;
  created_at: string;
}

interface SmartDonorCardsProps {
  requestedBloodGroup?: string;
  requestedCity?: string;
  requestedCountry?: string;
  showFilters?: boolean;
  maxCards?: number;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Blood compatibility matrix
const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export default function SmartDonorCards({ 
  requestedBloodGroup, 
  requestedCity, 
  requestedCountry,
  showFilters = true,
  maxCards 
}: SmartDonorCardsProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    loadDonors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [donors, searchTerm, selectedBloodType, selectedCity, availableOnly, requestedBloodGroup]);

  const loadDonors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDonors(data || []);
    } catch (err: any) {
      console.error('Error loading donors:', err);
      setError(err.message || 'Failed to load donors');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...donors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(donor =>
        donor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.phone_number.includes(searchTerm)
      );
    }

    // Blood type filter
    if (selectedBloodType) {
      filtered = filtered.filter(donor => donor.blood_group === selectedBloodType);
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(donor =>
        donor.city.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Available only filter
    if (availableOnly) {
      filtered = filtered.filter(donor => donor.is_available);
    }

    // If we have a requested blood group, prioritize compatible donors
    if (requestedBloodGroup) {
      const compatibleGroups = getCompatibleDonorGroups(requestedBloodGroup);
      filtered = filtered.filter(donor => compatibleGroups.includes(donor.blood_group));
      
      // Sort by compatibility
      filtered.sort((a, b) => {
        const aScore = getCompatibilityScore(a.blood_group, requestedBloodGroup);
        const bScore = getCompatibilityScore(b.blood_group, requestedBloodGroup);
        return bScore - aScore;
      });
    }

    // Apply max cards limit
    if (maxCards) {
      filtered = filtered.slice(0, maxCards);
    }

    setFilteredDonors(filtered);
  };

  const getCompatibleDonorGroups = (recipientBloodGroup: string): string[] => {
    const compatibleDonors: string[] = [];
    for (const [donorGroup, canDonateTo] of Object.entries(BLOOD_COMPATIBILITY)) {
      if (canDonateTo.includes(recipientBloodGroup)) {
        compatibleDonors.push(donorGroup);
      }
    }
    return compatibleDonors;
  };

  const getCompatibilityScore = (donorBloodGroup: string, requestedBloodGroup: string): number => {
    if (donorBloodGroup === requestedBloodGroup) return 3; // Exact match
    if (donorBloodGroup === 'O-') return 2; // Universal donor
    return 1; // Compatible
  };

  const getCompatibilityBadge = (donorBloodGroup: string, requestedBloodGroup?: string) => {
    if (!requestedBloodGroup) return null;
    
    if (donorBloodGroup === requestedBloodGroup) {
      return { text: 'Exact Match', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Star };
    }
    if (donorBloodGroup === 'O-') {
      return { text: 'Universal Donor', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Heart };
    }
    return { text: 'Compatible', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircle };
  };

  const getDaysSinceLastDonation = (lastDonationDate: string | null): number | null => {
    if (!lastDonationDate) return null;
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();
    return Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getBloodGroupColor = (bloodGroup: string): string => {
    const colors: Record<string, string> = {
      'A+': 'border-red-300 bg-red-50',
      'A-': 'border-red-400 bg-red-100',
      'B+': 'border-blue-300 bg-blue-50',
      'B-': 'border-blue-400 bg-blue-100',
      'AB+': 'border-purple-300 bg-purple-50',
      'AB-': 'border-purple-400 bg-purple-100',
      'O+': 'border-green-300 bg-green-50',
      'O-': 'border-yellow-400 bg-yellow-50',
    };
    return colors[bloodGroup] || 'border-gray-300 bg-gray-50';
  };

  const uniqueCities = Array.from(new Set(donors.map(d => d.city))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 mb-2">Error loading donors</div>
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={loadDonors}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {requestedBloodGroup ? `Donors for ${requestedBloodGroup}` : 'Available Donors'}
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''} found
            {requestedCity && ` in ${requestedCity}`}
          </p>
        </div>
        
        {showFilters && (
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && showFiltersPanel && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Donors</h3>
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Name, city, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Blood Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
              <select
                value={selectedBloodType}
                onChange={(e) => setSelectedBloodType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Types</option>
                {BLOOD_GROUPS.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Available Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available-only"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="available-only" className="text-sm text-gray-700">
                  Available only
                </label>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span>Search: {searchTerm}</span>
                <button onClick={() => setSearchTerm('')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedBloodType && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                <span>Type: {selectedBloodType}</span>
                <button onClick={() => setSelectedBloodType('')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCity && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <span>City: {selectedCity}</span>
                <button onClick={() => setSelectedCity('')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {availableOnly && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                <span>Available only</span>
                <button onClick={() => setAvailableOnly(false)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Donor Cards Grid */}
      {filteredDonors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No donors found</h3>
          <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDonors.map((donor) => {
            const daysSinceLastDonation = getDaysSinceLastDonation(donor.last_donation_date);
            const compatibilityBadge = getCompatibilityBadge(donor.blood_group, requestedBloodGroup);
            const donorCountry = getCountryByCode(donor.country);
            const bloodGroupColor = getBloodGroupColor(donor.blood_group);

            return (
              <div
                key={donor.id}
                className={`bg-white rounded-2xl shadow-lg border-2 ${bloodGroupColor} hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden`}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-full shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{donor.full_name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {compatibilityBadge && (
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border ${compatibilityBadge.color}`}>
                              <compatibilityBadge.icon className="h-3 w-3" />
                              <span>{compatibilityBadge.text}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Availability Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      donor.is_available 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {donor.is_available ? 'Available' : 'Not Available'}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Blood Group */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <Droplets className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-medium text-gray-600">Blood Group</span>
                      </div>
                      <span className="text-lg font-bold text-red-700">{donor.blood_group}</span>
                    </div>
                    
                    {/* Location */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-600">Location</span>
                      </div>
                      <div className="text-sm font-bold text-blue-700">
                        <div className="flex items-center space-x-1">
                          <span>{donor.city}</span>
                          <span className="text-lg">{donorCountry?.flag}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Last Donation */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-gray-600">Last Donation</span>
                    </div>
                    <span className="text-sm font-bold text-purple-700">
                      {daysSinceLastDonation 
                        ? `${daysSinceLastDonation} days ago`
                        : 'First-time donor'
                      }
                    </span>
                    {daysSinceLastDonation && (
                      <div className={`mt-1 text-xs ${
                        daysSinceLastDonation >= 90 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`}>
                        {daysSinceLastDonation >= 90 ? '✓ Eligible to donate' : `${90 - daysSinceLastDonation} days until eligible`}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {donor.is_available && (
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`tel:${donor.phone_number}`}
                        className="flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-3 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`sms:${donor.phone_number}?body=Hi ${donor.full_name}, we have a blood request for ${requestedBloodGroup || 'blood donation'}. Can you help save a life?`}
                        className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>SMS</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Registered {new Date(donor.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}