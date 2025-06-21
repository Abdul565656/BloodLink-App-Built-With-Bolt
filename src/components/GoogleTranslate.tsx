import React, { useEffect, useState } from 'react';
import { Globe, ChevronDown, Languages } from 'lucide-react';

interface GoogleTranslateProps {
  className?: string;
  isMobile?: boolean;
}

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslate({ className = '', isMobile = false }: GoogleTranslateProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');

  // Popular languages for BloodLink
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' }
  ];

  // Check if Google Translate is fully loaded
  const isGoogleTranslateReady = () => {
    return window.google && 
           window.google.translate && 
           window.google.translate.TranslateElement &&
           window.google.translate.TranslateElement.InlineLayout;
  };

  // Initialize Google Translate with retry mechanism
  const initializeGoogleTranslate = (retryCount = 0) => {
    if (isGoogleTranslateReady()) {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: languages.map(lang => lang.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
          },
          'google_translate_element'
        );
        setIsLoaded(true);
        console.log('🌐 Google Translate initialized successfully');
      } catch (error) {
        console.error('🌐 Error initializing Google Translate:', error);
        if (retryCount < 3) {
          setTimeout(() => initializeGoogleTranslate(retryCount + 1), 500);
        }
      }
    } else if (retryCount < 10) {
      // Retry after a short delay if not ready
      setTimeout(() => initializeGoogleTranslate(retryCount + 1), 200);
    } else {
      console.error('🌐 Google Translate failed to load after multiple attempts');
    }
  };

  useEffect(() => {
    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      initializeGoogleTranslate();
    };

    // Load Google Translate script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => {
        console.error('🌐 Failed to load Google Translate script');
      };
      document.head.appendChild(script);
    } else if (isGoogleTranslateReady()) {
      initializeGoogleTranslate();
    }

    // Cleanup function
    return () => {
      // Remove the callback from window
      if (window.googleTranslateElementInit) {
        delete window.googleTranslateElementInit;
      }
    };
  }, []);

  // Handle language selection
  const handleLanguageSelect = (languageCode: string, languageName: string) => {
    setCurrentLanguage(languageName);
    setIsOpen(false);

    // Trigger Google Translate
    if (isGoogleTranslateReady()) {
      try {
        const translateElement = window.google.translate.TranslateElement.getInstance();
        if (translateElement) {
          translateElement.showBanner(false);
          
          // Find and click the language option
          setTimeout(() => {
            const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (selectElement) {
              selectElement.value = languageCode;
              selectElement.dispatchEvent(new Event('change'));
            }
          }, 100);
        }
      } catch (error) {
        console.error('🌐 Error changing language:', error);
      }
    }

    console.log(`🌐 Language changed to: ${languageName} (${languageCode})`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  if (isMobile) {
    // Mobile version - simplified list
    return (
      <div className={`language-selector ${className}`}>
        <div className="px-2 py-2">
          <div className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group">
            <Globe className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
            <span className="font-medium">Language</span>
            <span className="text-sm text-gray-500">({currentLanguage})</span>
          </div>
          
          {/* Language Options */}
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {languages.slice(0, 8).map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code, language.name)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Hidden Google Translate Element */}
        <div id="google_translate_element" className="hidden"></div>
      </div>
    );
  }

  // Desktop version - dropdown
  return (
    <div className={`language-selector relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors font-medium rounded-lg hover:bg-red-50 group"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4 group-hover:text-red-500 transition-colors" />
        <span className="hidden lg:inline">{currentLanguage}</span>
        <span className="lg:hidden">Lang</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-4 duration-300">
            <div className="py-4">
              {/* Header */}
              <div className="px-4 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Languages className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-gray-900">Select Language</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">Choose your preferred language</p>
              </div>

              {/* Language List */}
              <div className="px-2 pt-3 max-h-80 overflow-y-auto">
                <div className="space-y-1">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageSelect(language.code, language.name)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        currentLanguage === language.name
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="flex-1 text-left font-medium">{language.name}</span>
                      {currentLanguage === language.name && (
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 pt-3 mt-3 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <Globe className="h-3 w-3" />
                  <span>Powered by Google Translate</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
}