import React from 'react';
import { MapPin, Users, Phone } from 'lucide-react';

interface Donor {
  id: string;
  full_name: string;
  phone_number: string;
  city: string;
  blood_group: string;
  is_available: boolean;
}

interface NearbyDonorsMapProps {
  donors?: Donor[];
  selectedBloodGroup?: string;
  selectedLocation?: string;
}

const NearbyDonorsMap: React.FC<NearbyDonorsMapProps> = ({
  donors = [],
  selectedBloodGroup,
  selectedLocation
}) => {
  const availableDonors = donors.filter(donor => donor.is_available);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Nearby Donors Map
        </h3>
      </div>

      {selectedLocation && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Showing donors in: <span className="font-medium">{selectedLocation}</span>
            {selectedBloodGroup && (
              <span> • Blood Group: <span className="font-medium">{selectedBloodGroup}</span></span>
            )}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {availableDonors.length > 0 ? (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Users className="h-4 w-4" />
              <span>{availableDonors.length} available donors found</span>
            </div>
            
            <div className="grid gap-3">
              {availableDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{donor.full_name}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {donor.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {donor.phone_number}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {donor.blood_group}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {selectedLocation || selectedBloodGroup
                ? 'No available donors found for the selected criteria'
                : 'Select a location and blood group to find nearby donors'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyDonorsMap;