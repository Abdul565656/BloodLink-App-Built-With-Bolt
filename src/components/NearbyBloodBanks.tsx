import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Search,
  Locate,
  Heart,
  Phone,
  Clock,
  Navigation,
  Loader2,
  AlertCircle,
  Building2,
  Globe,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface BloodBank {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'hospital' | 'blood_bank' | 'clinic' | 'donation_center';
  phone?: string;
  website?: string;
  opening_hours?: string;
  amenity?: string;
  healthcare?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Custom icons for different types of medical facilities
const createFacilityIcon = (type: string) => {
  const colors = {
    hospital: '#ef4444', // red
    blood_bank: '#dc2626', // dark red
    clinic: '#3b82f6', // blue
    donation_center: '#10b981' // green
  };
  
  const color = colors[type as keyof typeof colors] || '#6b7280';
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 15 15 30 15 30s15-15 15-30C30 6.7 23.3 0 15 0z" fill="${color}"/>
        <rect x="8" y="8" width="14" height="14" rx="2" fill="white"/>
        <path d="M13 10h4v2h-4v4h-2v-4H7v-2h4V6h2v4z" fill="${color}"/>
      </svg>
    `)}`,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -45],
  });
};

// User location icon
const userLocationIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="3" fill="white"/>
    </svg>
  `)}`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

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

export default function NearbyBloodBanks() {
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null);
  const [mapZoom, setMapZoom] = useState(2); // Global view by default
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Default global center
  const defaultCenter = new LatLng(20, 0); // Global view

  useEffect(() => {
    // Set initial map center to global view
    setMapCenter(defaultCenter);
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setUserLocation(location);
        const newCenter = new LatLng(location.latitude, location.longitude);
        setMapCenter(newCenter);
        setMapZoom(13);
        setLocationLoading(false);
        
        // Automatically search for nearby blood banks
        searchNearbyBloodBanks(location.latitude, location.longitude);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Try searching your city manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Search for location using Nominatim API
  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search location');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        setError(`No results found for "${query}". Try a different search term.`);
        setLoading(false);
        return;
      }

      const result = data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      
      const newCenter = new LatLng(lat, lon);
      setMapCenter(newCenter);
      setMapZoom(13);
      
      // Search for nearby blood banks
      await searchNearbyBloodBanks(lat, lon);
      
    } catch (err) {
      console.error('Error searching location:', err);
      setError('Failed to search location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search for nearby blood banks using Overpass API
  const searchNearbyBloodBanks = async (lat: number, lon: number, radius: number = 10000) => {
    setLoading(true);
    setError(null);

    try {
      // Overpass API query for hospitals, clinics, and blood banks
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          node["amenity"="clinic"](around:${radius},${lat},${lon});
          node["amenity"="blood_bank"](around:${radius},${lat},${lon});
          node["healthcare"="blood_bank"](around:${radius},${lat},${lon});
          node["healthcare"="blood_donation"](around:${radius},${lat},${lon});
          way["amenity"="hospital"](around:${radius},${lat},${lon});
          way["amenity"="clinic"](around:${radius},${lat},${lon});
          way["amenity"="blood_bank"](around:${radius},${lat},${lon});
          way["healthcare"="blood_bank"](around:${radius},${lat},${lon});
          way["healthcare"="blood_donation"](around:${radius},${lat},${lon});
        );
        out center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blood banks data');
      }

      const data = await response.json();
      
      const facilities: BloodBank[] = data.elements.map((element: any) => {
        const elementLat = element.lat || element.center?.lat;
        const elementLon = element.lon || element.center?.lon;
        
        if (!elementLat || !elementLon) return null;

        let type: BloodBank['type'] = 'hospital';
        if (element.tags?.amenity === 'clinic') type = 'clinic';
        if (element.tags?.amenity === 'blood_bank' || element.tags?.healthcare === 'blood_bank') type = 'blood_bank';
        if (element.tags?.healthcare === 'blood_donation') type = 'donation_center';

        return {
          id: element.id.toString(),
          name: element.tags?.name || `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}`,
          address: formatAddress(element.tags),
          latitude: elementLat,
          longitude: elementLon,
          type,
          phone: element.tags?.phone,
          website: element.tags?.website,
          opening_hours: element.tags?.opening_hours,
          amenity: element.tags?.amenity,
          healthcare: element.tags?.healthcare
        };
      }).filter(Boolean);

      setBloodBanks(facilities);
      
      if (facilities.length === 0) {
        setError('No blood banks or hospitals found in this area. Try expanding your search or searching a different location.');
      }

    } catch (err) {
      console.error('Error fetching blood banks:', err);
      setError('Failed to load nearby blood banks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format address from OSM tags
  const formatAddress = (tags: any): string => {
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:country']) parts.push(tags['addr:country']);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLocation(searchQuery.trim());
    }
  };

  // Get facility type display name
  const getFacilityTypeName = (type: BloodBank['type']): string => {
    const names = {
      hospital: 'Hospital',
      blood_bank: 'Blood Bank',
      clinic: 'Clinic',
      donation_center: 'Donation Center'
    };
    return names[type];
  };

  // Get facility type color
  const getFacilityTypeColor = (type: BloodBank['type']): string => {
    const colors = {
      hospital: 'text-red-600 bg-red-100',
      blood_bank: 'text-red-700 bg-red-200',
      clinic: 'text-blue-600 bg-blue-100',
      donation_center: 'text-green-600 bg-green-100'
    };
    return colors[type];
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Nearby Blood Banks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find blood banks, hospitals, and donation centers worldwide. Get directions and contact information.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for a city, address, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span>Search</span>
              </button>

              <button
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Use my current location"
              >
                {locationLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Locate className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">Locate Me</span>
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {locationError && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">Location Access Issue</p>
                <p className="text-yellow-700 text-sm mt-1">{locationError}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Search Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {bloodBanks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Found {bloodBanks.length} Medical Facilities
                </h3>
                <p className="text-gray-600 mt-1">
                  Blood banks, hospitals, and donation centers in your area
                </p>
              </div>
              
              {/* Legend */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Hospitals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-700 rounded-full"></div>
                  <span className="text-sm text-gray-600">Blood Banks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Clinics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Donation Centers</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-96 lg:h-[600px] relative">
            {mapCenter && (
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

                {/* User location marker */}
                {userLocation && (
                  <Marker
                    position={[userLocation.latitude, userLocation.longitude]}
                    icon={userLocationIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600 mb-2">Your Location</div>
                        <div className="text-sm text-gray-600">
                          Accuracy: ±{userLocation.accuracy ? Math.round(userLocation.accuracy) : 'Unknown'}m
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Blood bank markers */}
                {bloodBanks.map((facility) => (
                  <Marker
                    key={facility.id}
                    position={[facility.latitude, facility.longitude]}
                    icon={createFacilityIcon(facility.type)}
                  >
                    <Popup maxWidth={300}>
                      <div className="p-2">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight pr-2">
                            {facility.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFacilityTypeColor(facility.type)}`}>
                            {getFacilityTypeName(facility.type)}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{facility.address}</span>
                          </div>
                          
                          {facility.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <a 
                                href={`tel:${facility.phone}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {facility.phone}
                              </a>
                            </div>
                          )}
                          
                          {facility.opening_hours && (
                            <div className="flex items-start space-x-2">
                              <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{facility.opening_hours}</span>
                            </div>
                          )}
                          
                          {facility.website && (
                            <div className="flex items-center space-x-2">
                              <ExternalLink className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <a 
                                href={facility.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                          >
                            <Navigation className="h-4 w-4" />
                            <span>Get Directions</span>
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
            
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-red-600 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Searching for blood banks...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use This Map</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Click "Locate Me" to find blood banks near your current location</li>
                <li>• Search for any city or address worldwide to find nearby facilities</li>
                <li>• Click on map markers to see facility details and get directions</li>
                <li>• Different colored markers represent different types of medical facilities</li>
                <li>• Contact facilities directly to confirm blood donation availability</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Facilities List */}
        {bloodBanks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Facilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bloodBanks.slice(0, 12).map((facility) => (
                <div key={facility.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight pr-2">
                      {facility.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFacilityTypeColor(facility.type)}`}>
                      {getFacilityTypeName(facility.type)}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{facility.address}</span>
                    </div>
                    
                    {facility.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <a 
                          href={`tel:${facility.phone}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {facility.phone}
                        </a>
                      </div>
                    )}
                    
                    {facility.opening_hours && (
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{facility.opening_hours}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold w-full"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            {bloodBanks.length > 12 && (
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Showing 12 of {bloodBanks.length} facilities. Zoom in on the map to see more details.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}