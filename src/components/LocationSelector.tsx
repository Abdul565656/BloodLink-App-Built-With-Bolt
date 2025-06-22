import React, { useState, useEffect } from 'react';
import Select, { components, OptionProps, SingleValueProps } from 'react-select';
import { Globe, MapPin } from 'lucide-react';
// Make sure this path is correct for your project structure
import { countries, getCitiesForCountry } from '../lib/locationData'; 

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
  required = false,
}: LocationSelectorProps) {
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Prepare country options for the Select component
  const countryOptions: CountryOption[] = countries.map((country) => ({
    value: country.code,
    label: country.name,
    flag: country.flag,
  }));

  // Simplified and more robust effect to update cities when the country changes
  useEffect(() => {
    if (selectedCountry) {
      setIsLoadingCities(true);
      const cities = getCitiesForCountry(selectedCountry);
      const options = cities.map((city) => ({
        value: city,
        label: city,
      }));
      setCityOptions(options);
      
      // Reset city selection if the current one isn't in the new list
      if (selectedCity && !cities.includes(selectedCity)) {
        onCityChange('');
      }
      setIsLoadingCities(false);
    } else {
      // Clear cities and reset selection if no country is selected
      setCityOptions([]);
      onCityChange('');
    }
    // This effect should ONLY run when the selectedCountry changes.
  }, [selectedCountry]);

  // --- CRITICAL FIX 1: Custom components with correct props handling ---
  const CustomCountryOption = (props: OptionProps<CountryOption, false>) => {
    // We use components.Option to get the default accessibility and event handlers
    return (
      <components.Option {...props}>
        <div className="flex items-center space-x-3">
          <span className="text-lg">{props.data.flag}</span>
          <span>{props.data.label}</span>
        </div>
      </components.Option>
    );
  };
  
  const CustomCountrySingleValue = (props: SingleValueProps<CountryOption>) => (
    <div {...props.innerProps} className="flex items-center space-x-2">
      <span className="text-lg">{props.data.flag}</span>
      <span>{props.data.label}</span>
    </div>
  );


  // --- CRITICAL FIX 2: Custom styles with explicit z-index ---
  const getCustomSelectStyles = (hasError: boolean) => ({
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '48px',
      borderColor: hasError ? '#f87171' : state.isFocused ? '#ef4444' : '#d1d5db',
      backgroundColor: hasError ? '#fef2f2' : 'white',
      borderWidth: '1px',
      borderRadius: '0.75rem', // 12px for rounded-xl consistency
      boxShadow: state.isFocused ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none',
      '&:hover': {
        borderColor: hasError ? '#ef4444' : '#9ca3af',
      },
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#ef4444' : state.isFocused ? '#fef2f2' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      padding: '10px 12px',
      cursor: 'pointer',
    }),
    menu: (provided: any) => ({
      ...provided,
      // This is crucial for preventing the menu from being hidden
      zIndex: 50, 
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
    }),
  });

  return (
    <div className="space-y-6">
      {/* Country Selector */}
      <div>
        <label htmlFor="country-select" className="block text-sm font-semibold text-gray-700 mb-2">
          <Globe className="h-4 w-4 inline mr-2" />
          Country {required && '*'}
        </label>
        <Select
          inputId="country-select"
          options={countryOptions}
          value={countryOptions.find(option => option.value === selectedCountry) || null}
          onChange={(option) => onCountryChange(option?.value || '')}
          placeholder="Select your country..."
          isSearchable
          isClearable
          // --- CRITICAL FIX 3: Menu positioning fixes ---
          menuPosition="absolute"
          menuPlacement="auto"
          styles={getCustomSelectStyles(!!errors.country)}
          components={{
            Option: CustomCountryOption,
            SingleValue: CustomCountrySingleValue,
          }}
        />
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country}</p>
        )}
      </div>

      {/* City Selector */}
      <div>
        <label htmlFor="city-select" className="block text-sm font-semibold text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-2" />
          City {required && '*'}
        </label>
        <Select
          inputId="city-select"
          options={cityOptions}
          value={cityOptions.find(option => option.value === selectedCity) || null}
          onChange={(option) => onCityChange(option?.value || '')}
          placeholder={selectedCountry ? "Select your city..." : "Select a country first"}
          isSearchable
          isClearable
          isDisabled={!selectedCountry || cityOptions.length === 0}
          isLoading={isLoadingCities}
          // --- CRITICAL FIX 3 (Applied here too) ---
          menuPosition="absolute"
          menuPlacement="auto"
          styles={getCustomSelectStyles(!!errors.city)}
          noOptionsMessage={() => selectedCountry ? "No cities found for this country" : "Please select a country first"}
        />
        {errors.city && (
          <p className="mt-1 text-sm text-red-600">{errors.city}</p>
        )}
      </div>

      {/* Location Preview (No changes needed here) */}
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