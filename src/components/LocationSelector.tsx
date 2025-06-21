import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Globe, MapPin } from 'lucide-react';
import { countries, getCitiesForCountry, type Country } from '../lib/locationData';

interface LocationSelectorProps {
  selectedCountry: string;
  selectedCity: string;
  onCountryChange: (countryCode: string) => void;
  onCityChange: (city: string) => void;
  errors?: {
    country?: string;
    city?: string;
  };
  required?: boolean;
}

interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

interface CityOption {
  value: string;
  label: string;
}

export default function LocationSelector({
  selectedCountry,
  selectedCity,
  onCountryChange,
  onCityChange,
  errors = {},
  required = false
}: LocationSelectorProps) {
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Prepare country options
  const countryOptions: CountryOption[] = countries.map(country => ({
    value: country.code,
    label: country.name,
    flag: country.flag
  }));

  // Update cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      setIsLoadingCities(true);
      const cities = getCitiesForCountry(selectedCountry);
      const options = cities.map(city => ({
        value: city,
        label: city
      }));
      setCityOptions(options);
      setIsLoadingCities(false);
      
      // Clear city selection if it's not valid for the new country
      if (selectedCity && !cities.includes(selectedCity)) {
        onCityChange('');
      }
    } else {
      setCityOptions([]);
      onCityChange('');
    }
  }, [selectedCountry, selectedCity, onCityChange]);

  // Custom option component for countries (with flags)
  const CountryOption = ({ data, ...props }: any) => (
    <div {...props} className="flex items-center space-x-3 p-2 hover:bg-gray-50 cursor-pointer">
      <span className="text-lg">{data.flag}</span>
      <span className="text-gray-900">{data.label}</span>
    </div>
  );

  // Custom single value component for countries
  const CountrySingleValue = ({ data, ...props }: any) => (
    <div {...props} className="flex items-center space-x-2">
      <span className="text-lg">{data.flag}</span>
      <span className="text-gray-900">{data.label}</span>
    </div>
  );

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '48px',
      borderColor: errors.country || errors.city ? '#ef4444' : state.isFocused ? '#ef4444' : '#d1d5db',
      borderWidth: '1px',
      borderRadius: '8px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#ef4444'
      }
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#ef4444' : state.isFocused ? '#fef2f2' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      padding: '8px 12px',
      cursor: 'pointer'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af'
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#374151'
    })
  };

  return (
    <div className="space-y-6">
      {/* Country Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Globe className="h-4 w-4 inline mr-2" />
          Country {required && '*'}
        </label>
        <Select
          options={countryOptions}
          value={countryOptions.find(option => option.value === selectedCountry) || null}
          onChange={(option) => onCountryChange(option?.value || '')}
          placeholder="Select your country..."
          isSearchable
          isClearable
          styles={customSelectStyles}
          components={{
            Option: CountryOption,
            SingleValue: CountrySingleValue
          }}
          className={errors.country ? 'border-red-300' : ''}
        />
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country}</p>
        )}
      </div>

      {/* City Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-2" />
          City {required && '*'}
        </label>
        <Select
          options={cityOptions}
          value={cityOptions.find(option => option.value === selectedCity) || null}
          onChange={(option) => onCityChange(option?.value || '')}
          placeholder={selectedCountry ? "Select your city..." : "Please select a country first"}
          isSearchable
          isClearable
          isDisabled={!selectedCountry}
          isLoading={isLoadingCities}
          styles={customSelectStyles}
          className={errors.city ? 'border-red-300' : ''}
          noOptionsMessage={() => selectedCountry ? "No cities found" : "Please select a country first"}
        />
        {errors.city && (
          <p className="mt-1 text-sm text-red-600">{errors.city}</p>
        )}
        
        {selectedCountry && cityOptions.length === 0 && !isLoadingCities && (
          <p className="mt-1 text-sm text-gray-500">
            No cities available for this country. Please contact support to add your city.
          </p>
        )}
      </div>

      {/* Location Preview */}
      {selectedCountry && selectedCity && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-2 rounded-full">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Selected Location</p>
              <p className="text-green-700">
                {selectedCity}, {countries.find(c => c.code === selectedCountry)?.name}
                <span className="ml-2">
                  {countries.find(c => c.code === selectedCountry)?.flag}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}