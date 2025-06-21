import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  Heart,
  MapPin,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  Phone,
  Building2,
  Globe,
  BarChart3,
  Users,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCountryByCode } from '../lib/locationData';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Icon } from 'leaflet';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: string;
  hospital_name: string;
  city: string;
  country: string;
  contact_number: string;
  urgency_level: 'low' | 'medium' | 'high';
  status: string;
  created_at: string;
  preferred_date: string;
  preferred_time: string;
}

interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  requests: BloodRequest[];
  urgencyScore: number;
}

// Sample coordinates for major cities (in a real app, you'd use a geocoding service)
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Major cities with coordinates
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Toronto': { lat: 43.6532, lng: -79.3832 },
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Madrid': { lat: 40.4168, lng: -3.7038 },
  'Rome': { lat: 41.9028, lng: 12.4964 },
  'Moscow': { lat: 55.7558, lng: 37.6176 },
  'Beijing': { lat: 39.9042, lng: 116.4074 },
  'Shanghai': { lat: 31.2304, lng: 121.4737 },
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Mexico City': { lat: 19.4326, lng: -99.1332 },
  'Cairo': { lat: 30.0444, lng: 31.2357 },
  'Lagos': { lat: 6.5244, lng: 3.3792 },
  'Johannesburg': { lat: -26.2041, lng: 28.0473 },
  'Istanbul': { lat: 41.0082, lng: 28.9784 },
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Jakarta': { lat: -6.2088, lng: 106.8456 },
  'Manila': { lat: 14.5995, lng: 120.9842 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  'Karachi': { lat: 24.8607, lng: 67.0011 },
  'Lahore': { lat: 31.5204, lng: 74.3587 },
  'Dhaka': { lat: 23.8103, lng: 90.4125 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Vadodara': { lat: 22.3072, lng: 73.1812 },
  'Ludhiana': { lat: 30.9010, lng: 75.8573 },
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Nashik': { lat: 19.9975, lng: 73.7898 },
  'Faridabad': { lat: 28.4089, lng: 77.3178 },
  'Meerut': { lat: 28.9845, lng: 77.7064 },
  'Rajkot': { lat: 22.3039, lng: 70.8022 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Srinagar': { lat: 34.0837, lng: 74.7973 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433 },
  'Dhanbad': { lat: 23.7957, lng: 86.4304 },
  'Amritsar': { lat: 31.6340, lng: 74.8723 },
  'Allahabad': { lat: 25.4358, lng: 81.8463 },
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Howrah': { lat: 22.5958, lng: 88.2636 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Jabalpur': { lat: 23.1815, lng: 79.9864 }
};

// Component to handle map centering
const MapController: React.FC<{ center: LatLng | null; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

export default function BloodRequestHeatmap() {
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [mapCenter, setMapCenter] = useState<LatLng>(new LatLng(20, 0)); // Global view
  const [mapZoom, setMapZoom] = useState(2);

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    loadBloodRequests();
  }, []);

  useEffect(() => {
    processLocationData();
  }, [bloodRequests, selectedBloodGroup, selectedUrgency, selectedCountry]);

  const loadBloodRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBloodRequests(data || []);
    } catch (err: any) {
      console.error('Error loading blood requests:', err);
      setError(err.message || 'Failed to load blood requests');
    } finally {
      setLoading(false);
    }
  };

  const processLocationData = () => {
    // Filter requests based on selected filters
    let filteredRequests = bloodRequests;

    if (selectedBloodGroup !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.blood_group === selectedBloodGroup);
    }

    if (selectedUrgency !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.urgency_level === selectedUrgency);
    }

    if (selectedCountry !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.country === selectedCountry);
    }

    // Group requests by city and country
    const locationMap = new Map<string, LocationData>();

    filteredRequests.forEach(request => {
      const key = `${request.city}-${request.country}`;
      const coordinates = CITY_COORDINATES[request.city];

      if (coordinates) {
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            city: request.city,
            country: request.country,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            requests: [],
            urgencyScore: 0
          });
        }

        const location = locationMap.get(key)!;
        location.requests.push(request);

        // Calculate urgency score (high=3, medium=2, low=1)
        const urgencyPoints = request.urgency_level === 'high' ? 3 : 
                             request.urgency_level === 'medium' ? 2 : 1;
        location.urgencyScore += urgencyPoints;
      }
    });

    setLocationData(Array.from(locationMap.values()));
  };

  const getCircleColor = (urgencyScore: number, requestCount: number): string => {
    // Color based on urgency score and request count
    if (urgencyScore >= 10 || requestCount >= 5) return '#dc2626'; // Red - Very High
    if (urgencyScore >= 6 || requestCount >= 3) return '#ea580c'; // Orange Red - High
    if (urgencyScore >= 3 || requestCount >= 2) return '#f59e0b'; // Amber - Medium
    return '#10b981'; // Green - Low
  };

  const getCircleRadius = (requestCount: number): number => {
    // Radius based on number of requests (min 8, max 25)
    return Math.min(Math.max(8 + requestCount * 3, 8), 25);
  };

  const getUniqueCountries = (): string[] => {
    const countries = new Set(bloodRequests.map(req => req.country));
    return Array.from(countries).sort();
  };

  const getStats = () => {
    const total = locationData.reduce((sum, loc) => sum + loc.requests.length, 0);
    const highUrgency = locationData.reduce((sum, loc) => 
      sum + loc.requests.filter(req => req.urgency_level === 'high').length, 0);
    const cities = locationData.length;
    const countries = new Set(locationData.map(loc => loc.country)).size;

    return { total, highUrgency, cities, countries };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading blood demand data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 lg:py-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <Link
                to="/"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 lg:h-8 w-6 lg:w-8 text-red-600" />
                <span className="text-xl lg:text-2xl font-bold text-gray-900">Blood Demand Map</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={loadBloodRequests}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link
                to="/admin"
                className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="hidden sm:inline">Admin Dashboard</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Description */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Global Blood Demand Visualization
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real-time visualization of blood requests worldwide. Larger circles indicate higher demand, 
            colors represent urgency levels.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Heart className="h-8 lg:h-12 w-8 lg:w-12 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Urgency</p>
                <p className="text-2xl lg:text-3xl font-bold text-red-600">{stats.highUrgency}</p>
              </div>
              <AlertCircle className="h-8 lg:h-12 w-8 lg:w-12 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cities</p>
                <p className="text-2xl lg:text-3xl font-bold text-blue-600">{stats.cities}</p>
              </div>
              <MapPin className="h-8 lg:h-12 w-8 lg:w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-2xl lg:text-3xl font-bold text-green-600">{stats.countries}</p>
              </div>
              <Globe className="h-8 lg:h-12 w-8 lg:w-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
              <select
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Blood Groups</option>
                {BLOOD_GROUPS.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Urgency Levels</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Countries</option>
                {getUniqueCountries().map(country => {
                  const countryData = getCountryByCode(country);
                  return (
                    <option key={country} value={country}>
                      {countryData?.name || country}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedBloodGroup('all');
                  setSelectedUrgency('all');
                  setSelectedCountry('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6 lg:mb-8">
          <div className="h-96 lg:h-[600px] relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* Blood Request Markers */}
              {locationData.map((location, index) => (
                <CircleMarker
                  key={`${location.city}-${location.country}-${index}`}
                  center={[location.latitude, location.longitude]}
                  radius={getCircleRadius(location.requests.length)}
                  fillColor={getCircleColor(location.urgencyScore, location.requests.length)}
                  color="#ffffff"
                  weight={2}
                  opacity={0.8}
                  fillOpacity={0.7}
                >
                  <Popup maxWidth={350}>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-gray-900">
                          {location.city}
                        </h3>
                        <span className="text-lg">
                          {getCountryByCode(location.country)?.flag}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Requests:</span>
                          <span className="font-semibold text-gray-900">{location.requests.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Urgency Score:</span>
                          <span className="font-semibold text-gray-900">{location.urgencyScore}</span>
                        </div>
                      </div>

                      {/* Blood Groups Needed */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Blood Groups Needed:</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(location.requests.map(req => req.blood_group))).map(bloodGroup => (
                            <span key={bloodGroup} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              {bloodGroup}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recent Requests */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Recent Requests:</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {location.requests.slice(0, 3).map((request) => (
                            <div key={request.id} className="text-xs bg-gray-50 rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{request.patient_name}</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                  request.urgency_level === 'high' ? 'bg-red-100 text-red-800' :
                                  request.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {request.urgency_level}
                                </span>
                              </div>
                              <div className="text-gray-600">
                                {request.blood_group} • {request.hospital_name}
                              </div>
                            </div>
                          ))}
                          {location.requests.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{location.requests.length - 3} more requests
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 mb-6 lg:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="h-5 w-5 text-blue-600 mr-2" />
            Map Legend
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Circle Size Legend */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Circle Size = Number of Requests</h4>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">1-2 requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">3-4 requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">5+ requests</span>
                </div>
              </div>
            </div>

            {/* Color Legend */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Circle Color = Urgency Level</h4>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Low urgency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Medium urgency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">High urgency</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 lg:p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use This Map</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Click on circles to see detailed information about blood requests in that area</li>
                <li>• Use filters to focus on specific blood groups, urgency levels, or countries</li>
                <li>• Larger circles indicate more blood requests in that location</li>
                <li>• Red circles indicate high urgency, yellow for medium, green for low</li>
                <li>• Zoom in and out to explore different regions of the world</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}