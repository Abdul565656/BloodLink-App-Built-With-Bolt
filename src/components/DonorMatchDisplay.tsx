import React, { useState, useEffect } from 'react';
import { Users, Phone, MessageSquare, MapPin, Droplets, Clock, AlertTriangle, CheckCircle, Loader2, RefreshCw, Heart, Star, Globe, Flag, Filter, Search, Calendar } from 'lucide-react';
import { donorMatcherAgent, type BloodRequest, type MatchingDonor } from '../lib/donorMatcher';
import { getCountryByCode } from '../lib/locationData';

interface DonorMatchDisplayProps {
  bloodRequest: BloodRequest;
  onClose?: () => void;
}

interface FilterState {
  bloodType: string;
  city: string;
  lastDonation: string;
  urgency: string;
}

export default function DonorMatchDisplay({ bloodRequest, onClose }: DonorMatchDisplayProps) {
  const [allDonors, setAllDonors] = useState<MatchingDonor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<MatchingDonor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactedDonors, setContactedDonors] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    bloodType: '',
    city: '',
    lastDonation: '',
    urgency: ''
  });

  useEffect(() => {
    findMatches();
  }, [bloodRequest]);

  // Apply filters whenever filters or allDonors change
  useEffect(() => {
    applyFilters();
  }, [filters, allDonors]);

  const findMatches = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const matches = await donorMatcherAgent.findMatchingDonors(bloodRequest);
      setAllDonors(matches);
    } catch (err: any) {
      console.error('Error finding donor matches:', err);
      setError(err.message || 'Failed to find matching donors');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allDonors];

    // Filter by blood type
    if (filters.bloodType) {
      filtered = filtered.filter(donor => donor.blood_group === filters.bloodType);
    }

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter(donor => 
        donor.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filter by last donation
    if (filters.lastDonation) {
      filtered = filtered.filter(donor => {
        const days = donor.days_since_last_donation;
        switch (filters.lastDonation) {
          case 'recent':
            return days !== null && days <= 30;
          case 'eligible':
            return days === null || days >= 90;
          case 'waiting':
            return days !== null && days > 30 && days < 90;
          default:
            return true;
        }
      });
    }

    setFilteredDonors(filtered);
  };

  const handleRefresh = () => {
    findMatches(true);
  };

  const markAsContacted = (donorId: string) => {
    setContactedDonors(prev => new Set([...prev, donorId]));
  };

  const clearFilters = () => {
    setFilters({
      bloodType: '',
      city: '',
      lastDonation: '',
      urgency: ''
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-700 bg-red-100 border-red-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getCompatibilityBadge = (donor: MatchingDonor, requestedBloodGroup: string) => {
    if (donor.blood_group === requestedBloodGroup) {
      return { text: 'Exact Match', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Star };
    }
    if (donor.blood_group === 'O-') {
      return { text: 'Universal Donor', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Heart };
    }
    return { text: 'Compatible', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircle };
  };

  const getLocationBadge = (donor: MatchingDonor) => {
    const isSameCity = donor.city.toLowerCase() === bloodRequest.city.toLowerCase();
    const isSameCountry = donor.country === bloodRequest.country;
    
    if (isSameCity && isSameCountry) {
      return { text: 'Same City', color: 'bg-green-100 text-green-800 border-green-200', icon: MapPin };
    }
    if (isSameCountry) {
      return { text: 'Same Country', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Flag };
    }
    return { text: 'Different Country', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Globe };
  };

  const requestCountry = getCountryByCode(bloodRequest.country);

  // Get unique values for filter options
  const uniqueBloodTypes = [...new Set(allDonors.map(d => d.blood_group))];
  const uniqueCities = [...new Set(allDonors.map(d => d.city))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-red-600 p-4 rounded-full inline-block">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Finding Your Global Heroes</h2>
            <p className="text-xl text-gray-600 mb-6">Searching our worldwide network of life-savers...</p>
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full shadow-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {filteredDonors.length > 0 ? 'Global Heroes Ready to Help' : 'Searching Worldwide'}
          </h1>
          {filteredDonors.length > 0 && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Here are amazing people from around the world ready to save a life. Contact them now and make a difference.
            </p>
          )}
        </div>

        {/* Request Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Droplets className="h-6 w-6 text-red-600 mr-3" />
            Blood Request Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center space-x-3">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Droplets className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">Blood Group</p>
                  <p className="text-2xl font-bold text-red-700">{bloodRequest.blood_group}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Location</p>
                  <p className="text-sm font-bold text-blue-700 flex items-center">
                    {bloodRequest.city}, {requestCountry?.name}
                    <span className="ml-2">{requestCountry?.flag}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-600 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Preferred Time</p>
                  <p className="text-sm font-bold text-gray-700">{bloodRequest.preferred_date}</p>
                  <p className="text-sm font-bold text-gray-700">{bloodRequest.preferred_time}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl p-4 border border-yellow-100">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-yellow-500 to-red-500 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Urgency</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getUrgencyColor(bloodRequest.urgency_level)}`}>
                    {bloodRequest.urgency_level.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-4 shadow-lg">
            <div className="bg-red-600 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filters Section */}
        {allDonors.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 text-gray-600 mr-2" />
                Filter Results ({filteredDonors.length} of {allDonors.length})
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Blood Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                  <select
                    value={filters.bloodType}
                    onChange={(e) => setFilters(prev => ({ ...prev, bloodType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Types</option>
                    {uniqueBloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Last Donation Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Donation</label>
                  <select
                    value={filters.lastDonation}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastDonation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Donors</option>
                    <option value="eligible">Eligible (90+ days ago)</option>
                    <option value="recent">Recent (within 30 days)</option>
                    <option value="waiting">Waiting period (30-90 days)</option>
                  </select>
                </div>

                {/* Search by Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by city..."
                      value={filters.city}
                      onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Donors List */}
        {filteredDonors.length === 0 && !isLoading ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="mb-8">
              <div className="bg-gray-100 p-6 rounded-full inline-block mb-6">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {allDonors.length === 0 ? 'No Matching Donors Found Right Now' : 'No Donors Match Your Filters'}
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                {allDonors.length === 0 
                  ? "We couldn't find any available donors matching your criteria in your location at this moment. Don't worry - new donors join our global network every day."
                  : "Try adjusting your filters to see more results. You can clear all filters to see all available donors."
                }
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 max-w-2xl mx-auto mb-8">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h4>
              <ul className="text-blue-800 space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>We'll continue monitoring for new donors worldwide</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>You'll be notified as soon as a match becomes available</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Consider contacting your nearest hospital directly</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Try expanding your search to nearby cities or countries</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Searching Globally...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span>Search Again Worldwide</span>
                  </>
                )}
              </button>
              
              {allDonors.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : filteredDonors.length > 0 && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredDonors.length} Global Hero{filteredDonors.length !== 1 ? 's' : ''} Found
                </h3>
                <p className="text-gray-600 mt-1">Contact them now to save a life</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Re-matching...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span>Re-match Globally</span>
                  </>
                )}
              </button>
            </div>

            {/* Donor Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDonors.map((donor, index) => {
                const eligibility = donorMatcherAgent.getDonationEligibility(donor.days_since_last_donation);
                const compatibilityBadge = getCompatibilityBadge(donor, bloodRequest.blood_group);
                const locationBadge = getLocationBadge(donor);
                const donorCountry = getCountryByCode(donor.country);
                const isContacted = contactedDonors.has(donor.id);
                const BadgeIcon = compatibilityBadge.icon;
                const LocationIcon = locationBadge.icon;

                return (
                  <div 
                    key={donor.id} 
                    className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                      isContacted ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:border-red-200'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-full shadow-lg">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                #{index + 1}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{donor.full_name}</h4>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold border ${compatibilityBadge.color}`}>
                                <BadgeIcon className="h-4 w-4" />
                                <span>{compatibilityBadge.text}</span>
                              </span>
                              {isContacted && (
                                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Contacted</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold ${
                            eligibility.eligible 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {eligibility.eligible ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                            <span className="text-sm">
                              {eligibility.eligible ? 'Eligible' : 'Not Eligible'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Droplets className="h-5 w-5 text-red-600" />
                            <span className="text-sm font-medium text-red-600">Blood Group</span>
                          </div>
                          <span className="text-2xl font-bold text-red-700">{donor.blood_group}</span>
                        </div>
                        
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Globe className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">Location</span>
                          </div>
                          <div className="text-sm font-bold text-blue-700">
                            <div className="flex items-center space-x-1">
                              <span>{donor.city}</span>
                              <span className="text-lg">{donorCountry?.flag}</span>
                            </div>
                            <div className="text-xs text-blue-600">{donorCountry?.name}</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Phone className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-600">Contact</span>
                          </div>
                          <span className="text-sm font-bold text-gray-700">{donor.phone_number}</span>
                        </div>
                        
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-600">Last Donation</span>
                          </div>
                          <span className="text-sm font-bold text-purple-700">
                            {donor.days_since_last_donation 
                              ? `${donor.days_since_last_donation} days ago`
                              : 'First-time donor'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Location Badge */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold border ${locationBadge.color}`}>
                          <LocationIcon className="h-4 w-4" />
                          <span>{locationBadge.text}</span>
                        </span>
                      </div>

                      {/* Eligibility Status */}
                      <div className={`rounded-xl p-4 mb-6 border ${
                        eligibility.eligible 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <p className={`text-sm font-medium ${
                          eligibility.eligible ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          {eligibility.message}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      {eligibility.eligible && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <a
                            href={`tel:${donor.phone_number}`}
                            onClick={() => markAsContacted(donor.id)}
                            className="flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Phone className="h-5 w-5" />
                            <span>Call Now</span>
                          </a>
                          <a
                            href={`sms:${donor.phone_number}?body=Hi ${donor.full_name}, we have an urgent blood request for ${bloodRequest.blood_group} at ${bloodRequest.hospital_name}, ${bloodRequest.city}, ${requestCountry?.name}. Can you help save a life?`}
                            onClick={() => markAsContacted(donor.id)}
                            className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <MessageSquare className="h-5 w-5" />
                            <span>Send SMS</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <div className="mt-12 text-center">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}