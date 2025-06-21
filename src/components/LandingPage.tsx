import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Clock, Shield, Phone, MapPin, BarChart3, Droplets, Globe, Zap, Star, ArrowRight, CheckCircle, TrendingUp, Menu, X, Building2, ChevronDown } from 'lucide-react';
import GoogleTranslate from './GoogleTranslate';
import Footer from './Footer';

export default function LandingPage() {
  const [animatedStats, setAnimatedStats] = useState({
    donors: 0,
    requests: 0,
    lives: 0,
    cities: 0
  });

  const [whyStats, setWhyStats] = useState({
    livesSaved: 0,
    donorsRegistered: 0,
    citiesCovered: 0
  });

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  // Navbar scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  const finalStats = {
    donors: 15000,
    requests: 8500,
    lives: 25000,
    cities: 150
  };

  const finalWhyStats = {
    livesSaved: 1240,
    donorsRegistered: 3200,
    citiesCovered: 85
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        donors: Math.floor(finalStats.donors * progress),
        requests: Math.floor(finalStats.requests * progress),
        lives: Math.floor(finalStats.lives * progress),
        cities: Math.floor(finalStats.cities * progress)
      });

      setWhyStats({
        livesSaved: Math.floor(finalWhyStats.livesSaved * progress),
        donorsRegistered: Math.floor(finalWhyStats.donorsRegistered * progress),
        citiesCovered: Math.floor(finalWhyStats.citiesCovered * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(finalStats);
        setWhyStats(finalWhyStats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsServicesDropdownOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      const target = e.target;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
      if (isServicesDropdownOpen && !target.closest('.services-dropdown')) {
        setIsServicesDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen, isServicesDropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsServicesDropdownOpen(false);
  };

  // This function is still needed for the header button.
  const handleBoltClick = () => {
    window.open('https://bolt.new/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-pink-50"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.1)" />
                <stop offset="50%" stopColor="rgba(239, 68, 68, 0.05)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.1)" />
              </linearGradient>
            </defs>
            <path 
              d="M0,400 C300,300 600,500 1200,400 L1200,800 L0,800 Z" 
              fill="url(#wave-gradient)"
              className="animate-pulse"
            />
            <path 
              d="M0,500 C400,400 800,600 1200,500 L1200,800 L0,800 Z" 
              fill="rgba(239, 68, 68, 0.03)"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </div>
      </div>

      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 lg:py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className={`bg-gradient-to-r from-red-500 to-red-600 p-1.5 lg:p-2 rounded-xl shadow-lg transition-all duration-300 ${
                isScrolled ? 'scale-95' : 'scale-100'
              }`}>
                <Heart className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  BloodLink
                </span>
                <div className="text-xs text-gray-500 font-medium hidden sm:block">Global Blood Network</div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {/* Services Dropdown */}
              <div className="services-dropdown relative">
                <button
                  onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors font-medium"
                >
                  <span>Services</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isServicesDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsServicesDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-4 duration-300">
                      <div className="py-2">
                        <Link 
                          to="/heatmap" 
                          onClick={() => setIsServicesDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span>Blood Demand Map</span>
                        </Link>
                        <Link 
                          to="/nearby-blood-banks" 
                          onClick={() => setIsServicesDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <Building2 className="h-4 w-4" />
                          <span>Find Blood Banks</span>
                        </Link>
                        <Link 
                          to="/admin" 
                          onClick={() => setIsServicesDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link to="/how-it-works" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                How It Works
              </Link>
              <Link to="/get-involved" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                Get Involved
              </Link>
              <a href="#stats" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                Impact
              </a>
              
              {/* Google Translate - Desktop */}
              <GoogleTranslate />
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Link
                  to="/donate"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Donate
                </Link>
                <Link
                  to="/request"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Request
                </Link>
              </div>
              
              {/* Built with Bolt Badge - Desktop */}
              <div className="relative group">
                <button
                  onClick={handleBoltClick}
                  className={`flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-2 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-yellow-300 hover:from-yellow-300 hover:to-yellow-400 ${
                    isScrolled ? 'scale-95' : 'scale-100'
                  }`}
                  aria-label="Built with Bolt.new"
                >
                  <Zap className="h-4 w-4" />
                  <span className="hidden xl:inline">Built with Bolt</span>
                  <span className="xl:hidden">Bolt</span>
                </button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
                  <div className="text-center">
                    <div className="font-semibold">Built with Bolt.new</div>
                    <div className="text-xs text-gray-300 mt-1">World's Largest AI Hackathon</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="mobile-menu-container lg:hidden relative">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 transform rotate-0 transition-transform duration-200" />
                ) : (
                  <Menu className="h-6 w-6 transform rotate-0 transition-transform duration-200" />
                )}
              </button>

              {/* Mobile Menu Dropdown */}
              {isMobileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-in fade-in-0 duration-200"
                    onClick={closeMobileMenu}
                  />
                  
                  {/* Mobile Menu */}
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-4 duration-300 max-h-[80vh] overflow-y-auto">
                    <div className="py-4">
                      {/* Mobile Menu Header */}
                      <div className="px-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
                            <Heart className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">BloodLink</div>
                            <div className="text-xs text-gray-500">Global Blood Network</div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="px-4 py-4 border-b border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            to="/donate"
                            onClick={closeMobileMenu}
                            className="bg-red-600 text-white text-center py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                          >
                            Donate Blood
                          </Link>
                          <Link
                            to="/request"
                            onClick={closeMobileMenu}
                            className="bg-blue-600 text-white text-center py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Request Blood
                          </Link>
                        </div>
                      </div>

                      {/* Mobile Menu Items */}
                      <nav className="px-2 pt-2 space-y-1">
                        <Link
                          to="/how-it-works"
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                        >
                          <Heart className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                          <span className="font-medium">How It Works</span>
                        </Link>

                        <Link
                          to="/get-involved"
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                        >
                          <Users className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                          <span className="font-medium">Get Involved</span>
                        </Link>

                        <Link
                          to="/heatmap"
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                        >
                          <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                          <span className="font-medium">Blood Demand Map</span>
                        </Link>

                        <Link
                          to="/nearby-blood-banks"
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                        >
                          <Building2 className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                          <span className="font-medium">Find Blood Banks</span>
                        </Link>

                        <a
                          href="#stats"
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                        >
                          <Star className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                          <span className="font-medium">Impact</span>
                        </a>

                        <Link
                          to="/admin"
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                        >
                          <BarChart3 className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>

                        {/* Google Translate - Mobile */}
                        <div className="px-4 py-2">
                          <GoogleTranslate isMobile={true} />
                        </div>

                        {/* Built with Bolt Badge - Mobile */}
                        <button
                          onClick={() => {
                            handleBoltClick();
                            closeMobileMenu();
                          }}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 group w-full"
                        >
                          <Zap className="h-5 w-5 text-yellow-500 group-hover:text-yellow-600" />
                          <span className="font-medium">Built with Bolt</span>
                          <div className="ml-auto">
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-2 py-1 rounded-md text-xs font-bold">
                              NEW
                            </div>
                          </div>
                        </button>
                      </nav>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Add top padding to account for fixed header */}
      <section className="relative z-10 pt-24 lg:pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-700 font-medium text-sm">Live Global Network</span>
              <Globe className="h-4 w-4 text-red-600" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
              Donate Blood.
              <span className="block bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Save Lives.
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-6xl text-gray-700">
                Instantly.
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Connect with blood donors worldwide through our AI-powered platform. 
              Every donation saves up to <span className="font-bold text-red-600">3 lives</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center mb-16">
              <Link
                to="/request"
                className="group bg-red-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl text-lg font-semibold hover:bg-red-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center space-x-3 min-w-[240px] justify-center"
              >
                <Heart className="h-5 lg:h-6 w-5 lg:w-6 group-hover:animate-pulse" />
                <span>I Need Blood</span>
                <ArrowRight className="h-4 lg:h-5 w-4 lg:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/donate"
                className="group bg-white text-red-600 border-2 border-red-600 px-6 lg:px-8 py-3 lg:py-4 rounded-2xl text-lg font-semibold hover:bg-red-600 hover:text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center space-x-3 min-w-[240px] justify-center"
              >
                <Users className="h-5 lg:h-6 w-5 lg:w-6" />
                <span>I Want to Donate</span>
                <ArrowRight className="h-4 lg:h-5 w-4 lg:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-purple-500" />
                <span>Global Network</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>AI-Powered Matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BloodLink Section */}
      <section className="relative z-10 py-20 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Why BloodLink?
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Every 2 seconds, someone around the world needs blood. In those critical moments, 
                time isn't just precious—it's everything. BloodLink bridges the gap between life-saving 
                donors and those who desperately need help, creating a global network of hope that 
                operates 24/7, 365 days a year.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that geography should never be a barrier to saving a life. Whether you're 
                in New York or New Delhi, São Paulo or Sydney, BloodLink connects you to a community 
                of heroes ready to make a difference.
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-in fade-in-0 slide-in-from-bottom-6 duration-1000 delay-300">
            {/* Lives Saved */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full inline-block mb-6 shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {whyStats.livesSaved.toLocaleString()}+
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Lives Saved</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Real people whose lives were saved through our platform. Each number represents 
                  a family reunited, a future restored.
                </p>
              </div>
            </div>

            {/* Donors Registered */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full inline-block mb-6 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {whyStats.donorsRegistered.toLocaleString()}+
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Donors Registered</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Compassionate individuals from around the world who've joined our mission 
                  to save lives through blood donation.
                </p>
              </div>
            </div>

            {/* Cities Covered */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full inline-block mb-6 shadow-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {whyStats.citiesCovered}+
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cities Covered</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Major cities across 6 continents where BloodLink has successfully 
                  connected donors with those in need.
                </p>
              </div>
            </div>
          </div>

          {/* Success Story */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-red-100 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-600">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Story Content */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-green-700 font-semibold text-lg">Success Story</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  "BloodLink Saved My Daughter's Life"
                </h3>
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    <span className="font-semibold text-gray-900">"When my 8-year-old daughter Emma was rushed to the hospital after a car accident, 
                    doctors told us she needed an emergency blood transfusion. Her rare AB-negative blood type 
                    made finding donors incredibly difficult."</span>
                  </p>
                  
                  <p>
                    "Within 20 minutes of posting on BloodLink, we found three compatible donors in our city. 
                    Sarah, a teacher from across town, dropped everything to help. She didn't know us, but she 
                    came anyway."
                  </p>
                  
                  <p>
                    "Today, Emma is healthy, happy, and back to playing soccer. Sarah isn't just a donor to us—she's 
                    family. BloodLink didn't just connect us to blood; it connected us to an angel."
                  </p>
                  
                  <div className="flex items-center space-x-3 pt-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Maria Rodriguez</p>
                      <p className="text-sm text-gray-600">Mother, Barcelona, Spain</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Image */}
              <div className="relative">
                <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl p-8 text-center">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full">
                        <Heart className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">20 Minutes</h4>
                    <p className="text-gray-600 mb-4">From emergency to donor match</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="font-semibold text-red-700">Blood Type</div>
                        <div className="text-red-600">AB-negative</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="font-semibold text-green-700">Donors Found</div>
                        <div className="text-green-600">3 matches</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Life-saving connection</p>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-red-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section id="stats" className="relative z-10 py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Global Impact in Real-Time
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every number represents a life touched, a community strengthened, and hope restored.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="bg-blue-600 p-4 rounded-2xl inline-block mb-4 group-hover:rotate-12 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {animatedStats.donors.toLocaleString()}+
                </div>
                <div className="text-blue-700 font-semibold">Global Donors</div>
                <div className="text-sm text-blue-600 mt-2">Ready to help worldwide</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="bg-green-600 p-4 rounded-2xl inline-block mb-4 group-hover:rotate-12 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {animatedStats.requests.toLocaleString()}+
                </div>
                <div className="text-green-700 font-semibold">Lives Helped</div>
                <div className="text-sm text-green-600 mt-2">Successful connections</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="bg-red-600 p-4 rounded-2xl inline-block mb-4 group-hover:rotate-12 transition-transform duration-300">
                  <Droplets className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {animatedStats.lives.toLocaleString()}+
                </div>
                <div className="text-red-700 font-semibold">Lives Saved</div>
                <div className="text-sm text-red-600 mt-2">Through blood donations</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="bg-purple-600 p-4 rounded-2xl inline-block mb-4 group-hover:rotate-12 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {animatedStats.cities}+
                </div>
                <div className="text-purple-700 font-semibold">Cities Covered</div>
                <div className="text-sm text-purple-600 mt-2">Across 50+ countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How BloodLink Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four simple steps to save lives or get the help you need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Request or Donate",
                description: "Submit your blood request or register as a donor",
                icon: Heart,
                color: "red"
              },
              {
                step: 2,
                title: "AI Matches",
                description: "Our AI finds the best compatible donors nearby",
                icon: Zap,
                color: "yellow"
              },
              {
                step: 3,
                title: "Direct Contact",
                description: "Connect directly with donors or patients",
                icon: Phone,
                color: "blue"
              },
              {
                step: 4,
                title: "Life Saved",
                description: "Complete the donation and save lives",
                icon: Star,
                color: "green"
              }
            ].map((item, index) => {
              const Icon = item.icon;
              const colorClasses = {
                red: "from-red-500 to-red-600 text-red-600 bg-red-50",
                yellow: "from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50",
                blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50",
                green: "from-green-500 to-green-600 text-green-600 bg-green-50"
              };

              return (
                <div key={index} className="text-center group">
                  <div className={`${colorClasses[item.color].split(' ')[2]} rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105`}>
                    <div className={`bg-gradient-to-r ${colorClasses[item.color].split(' ')[0]} ${colorClasses[item.color].split(' ')[1]} p-4 rounded-2xl inline-block mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-2">
                      Step {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/how-it-works"
              className="inline-flex items-center space-x-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Learn More</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose BloodLink?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets human compassion to create the world's most effective blood donation network
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Global Network",
                description: "Connect with donors and patients worldwide across 195+ countries"
              },
              {
                icon: Zap,
                title: "AI-Powered Matching",
                description: "Smart algorithm matches donors and patients in seconds, not hours"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your data is protected with enterprise-grade security and privacy controls"
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description: "Emergency blood requests can be submitted and matched any time"
              },
              {
                icon: Phone,
                title: "Direct Communication",
                description: "Seamless communication between donors and patients"
              },
              {
                icon: CheckCircle,
                title: "Verified Network",
                description: "All donors and requests are verified for safety and authenticity"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-2xl inline-block mb-6">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-red-100 mb-12 max-w-3xl mx-auto">
            Join thousands of heroes worldwide who are making a difference. 
            Every donation can save up to 3 lives.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/donate"
              className="bg-white text-red-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Users className="h-6 w-6" />
              <span>Become a Global Donor</span>
            </Link>
            
            <Link
              to="/request"
              className="bg-red-800 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-red-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Heart className="h-6 w-6" />
              <span>Request Blood Now</span>
            </Link>
          </div>
        </div>
      </section>
         <Footer />
    </div>
  );
}