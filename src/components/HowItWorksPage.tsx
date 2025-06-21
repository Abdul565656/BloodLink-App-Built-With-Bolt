import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Globe, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Droplets, 
  Bell, 
  Shield, 
  Zap,
  ArrowLeft,
  Star,
  Target,
  Smartphone,
  Mail
} from 'lucide-react';

export default function HowItWorksPage() {
  const donorSteps = [
    {
      number: 1,
      title: "Register Worldwide",
      description: "Sign up from anywhere in the world with your location and blood type",
      icon: Globe,
      color: "bg-blue-500",
      details: [
        "Select your country and city from our global database",
        "Provide your blood group and contact information",
        "Set your availability preferences",
        "Join our worldwide network of heroes"
      ]
    },
    {
      number: 2,
      title: "Get Smart Notifications",
      description: "Receive instant alerts when blood is needed in your area",
      icon: Bell,
      color: "bg-green-500",
      details: [
        "SMS and WhatsApp notifications for urgent requests",
        "Email updates for non-urgent matches",
        "Location-based matching within your city/country",
        "Customizable notification preferences"
      ]
    },
    {
      number: 3,
      title: "Connect & Save Lives",
      description: "Contact patients directly and coordinate donation",
      icon: Heart,
      color: "bg-red-500",
      details: [
        "Direct contact with patients or hospitals",
        "Hospital location and appointment details",
        "Real-time communication through the platform",
        "Track your life-saving impact"
      ]
    }
  ];

  const requesterSteps = [
    {
      number: 1,
      title: "Submit Global Request",
      description: "Create a blood request visible to donors worldwide",
      icon: Target,
      color: "bg-purple-500",
      details: [
        "Specify blood group and urgency level",
        "Add hospital and location details",
        "Include patient information and contact",
        "Set preferred date and time"
      ]
    },
    {
      number: 2,
      title: "AI-Powered Matching",
      description: "Our system finds compatible donors in your area and beyond",
      icon: Zap,
      color: "bg-yellow-500",
      details: [
        "Blood compatibility algorithm",
        "Location-based prioritization",
        "Donor availability checking",
        "Urgency-based ranking"
      ]
    },
    {
      number: 3,
      title: "Instant Connections",
      description: "Get connected with available donors immediately",
      icon: Users,
      color: "bg-indigo-500",
      details: [
        "Real-time donor notifications",
        "Direct contact information",
        "Multiple donor options",
        "24/7 emergency support"
      ]
    }
  ];

  const features = [
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with donors and patients worldwide across 195+ countries"
    },
    {
      icon: Smartphone,
      title: "Smart Notifications",
      description: "Multi-channel alerts via SMS, WhatsApp, and email for instant communication"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy controls"
    },
    {
      icon: Clock,
      title: "Real-Time Matching",
      description: "AI-powered algorithm matches donors and patients in seconds, not hours"
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "Smart location-based matching prioritizes nearby donors first"
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Seamless communication between donors and patients through multiple channels"
    }
  ];

  const bloodCompatibility = [
    { donor: "O-", recipients: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], label: "Universal Donor" },
    { donor: "O+", recipients: ["O+", "A+", "B+", "AB+"], label: "Common Donor" },
    { donor: "A-", recipients: ["A-", "A+", "AB-", "AB+"], label: "A Negative" },
    { donor: "A+", recipients: ["A+", "AB+"], label: "A Positive" },
    { donor: "B-", recipients: ["B-", "B+", "AB-", "AB+"], label: "B Negative" },
    { donor: "B+", recipients: ["B+", "AB+"], label: "B Positive" },
    { donor: "AB-", recipients: ["AB-", "AB+"], label: "AB Negative" },
    { donor: "AB+", recipients: ["AB+"], label: "Universal Recipient" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Heart className="h-6 lg:h-8 w-6 lg:w-8 text-red-600" />
              <span className="text-xl lg:text-2xl font-bold text-gray-900">BloodLink</span>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link
                to="/donate"
                className="bg-red-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm lg:text-base"
              >
                Become Donor
              </Link>
              <Link
                to="/request"
                className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
              >
                Request Blood
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 lg:p-4 rounded-full shadow-lg">
              <Heart className="h-8 lg:h-12 w-8 lg:w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            How BloodLink
            <span className="text-red-600 block">Saves Lives Globally</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how our AI-powered platform connects blood donors with patients worldwide, 
            using smart notifications and real-time matching to save lives across the globe.
          </p>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">The BloodLink Process</h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              From registration to life-saving donation, here's how our platform works
            </p>
          </div>

          <div className="space-y-16 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-16">
            {/* For Donors */}
            <div>
              <div className="text-center mb-8 lg:mb-12">
                <div className="bg-red-100 p-3 lg:p-4 rounded-full inline-block mb-4">
                  <Users className="h-6 lg:h-8 w-6 lg:w-8 text-red-600" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">For Blood Donors</h3>
                <p className="text-gray-600">Join our global network of life-savers</p>
              </div>

              <div className="space-y-6 lg:space-y-8">
                {donorSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 lg:space-x-6">
                      <div className={`${step.color} p-3 lg:p-4 rounded-full shadow-lg flex-shrink-0`}>
                        <Icon className="h-5 lg:h-6 w-5 lg:w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
                            Step {step.number}
                          </span>
                          <h4 className="text-lg lg:text-xl font-bold text-gray-900">{step.title}</h4>
                        </div>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <Link
                  to="/donate"
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Users className="h-5 w-5" />
                  <span>Become a Global Donor</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* For Requesters */}
            <div>
              <div className="text-center mb-8 lg:mb-12">
                <div className="bg-blue-100 p-3 lg:p-4 rounded-full inline-block mb-4">
                  <Heart className="h-6 lg:h-8 w-6 lg:w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">For Blood Requesters</h3>
                <p className="text-gray-600">Get help from donors worldwide</p>
              </div>

              <div className="space-y-6 lg:space-y-8">
                {requesterSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 lg:space-x-6">
                      <div className={`${step.color} p-3 lg:p-4 rounded-full shadow-lg flex-shrink-0`}>
                        <Icon className="h-5 lg:h-6 w-5 lg:w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
                            Step {step.number}
                          </span>
                          <h4 className="text-lg lg:text-xl font-bold text-gray-900">{step.title}</h4>
                        </div>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <Link
                  to="/request"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Heart className="h-5 w-5" />
                  <span>Request Blood Globally</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why BloodLink Works</h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets human compassion to create the world's most effective blood donation network
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-full inline-block mb-6">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blood Compatibility Chart */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Blood Compatibility Guide</h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding blood type compatibility helps us make the right matches quickly and safely
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 lg:p-8 border border-red-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Donation Compatibility</h3>
                <div className="space-y-4">
                  {bloodCompatibility.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                            {item.donor}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm lg:text-base">{item.label}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.recipients.map((recipient, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            {recipient}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Key Facts</h3>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Star className="h-6 w-6 text-yellow-500" />
                      <h4 className="font-bold text-gray-900">Universal Donor</h4>
                    </div>
                    <p className="text-gray-600 text-sm lg:text-base">
                      O-negative blood can be given to anyone in an emergency. 
                      Only 6.6% of people have this blood type.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Heart className="h-6 w-6 text-red-500" />
                      <h4 className="font-bold text-gray-900">Universal Recipient</h4>
                    </div>
                    <p className="text-gray-600 text-sm lg:text-base">
                      AB-positive people can receive blood from any blood type. 
                      They represent about 3.4% of the population.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="h-6 w-6 text-blue-500" />
                      <h4 className="font-bold text-gray-900">Donation Frequency</h4>
                    </div>
                    <p className="text-gray-600 text-sm lg:text-base">
                      You can donate whole blood every 8-12 weeks. 
                      Your body fully replenishes the donated blood within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-lg lg:text-xl text-red-100 mb-8 lg:mb-12 max-w-3xl mx-auto">
            Join thousands of heroes worldwide who are making a difference. 
            Every donation can save up to 3 lives.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
            <Link
              to="/donate"
              className="bg-white text-red-600 px-6 lg:px-8 py-3 lg:py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Users className="h-6 w-6" />
              <span>Become a Global Donor</span>
            </Link>
            
            <Link
              to="/request"
              className="bg-red-800 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg text-lg font-semibold hover:bg-red-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Heart className="h-6 w-6" />
              <span>Request Blood Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 lg:space-x-3 mb-4">
                <Heart className="h-6 lg:h-8 w-6 lg:w-8 text-red-600" />
                <span className="text-xl lg:text-2xl font-bold">BloodLink</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Connecting blood donors with those in need worldwide. 
                Saving lives, one donation at a time.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/donate" className="text-gray-400 hover:text-white transition-colors">Become Donor</Link></li>
                <li><Link to="/request" className="text-gray-400 hover:text-white transition-colors">Request Blood</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-red-600" />
                  <span className="text-gray-400">help@bloodlink.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-red-600" />
                  <span className="text-gray-400">Available Worldwide</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 lg:mt-12 text-center">
            <p className="text-gray-400">
              © 2025 BloodLink. All rights reserved. Built for saving lives globally.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}