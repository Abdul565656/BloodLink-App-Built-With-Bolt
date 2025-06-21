import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Zap, Phone, Mail, Globe } from 'lucide-react';

export default function Footer() {
  // This function is self-contained within the Footer component.
  const handleBoltClick = () => {
    window.open('https://bolt.new/', '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="relative z-10 bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold">BloodLink</span>
                <div className="text-sm text-gray-400">Global Blood Network</div>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md mb-6">
              Connecting blood donors with those in need worldwide.
              Saving lives, one donation at a time.
            </p>

            {/* Bolt Badge in Footer */}
            <button
              onClick={handleBoltClick}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-yellow-300 hover:from-yellow-300 hover:to-yellow-400"
            >
              <Zap className="h-4 w-4" />
              <span>Built with Bolt</span>
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/donate" className="text-gray-400 hover:text-white transition-colors">Become Donor</Link></li>
              <li><Link to="/request" className="text-gray-400 hover:text-white transition-colors">Request Blood</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/get-involved" className="text-gray-400 hover:text-white transition-colors">Get Involved</Link></li>
              <li><Link to="/heatmap" className="text-gray-400 hover:text-white transition-colors">Blood Demand Map</Link></li>
              <li><Link to="/nearby-blood-banks" className="text-gray-400 hover:text-white transition-colors">Blood Banks</Link></li>
              <li><Link to="/admin" className="text-gray-400 hover:text-white transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-red-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-red-400" />
                <span className="text-gray-400">help@bloodlink.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-red-400" />
                <span className="text-gray-400">Available Worldwide</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-12 text-center">
          <p className="text-gray-400">
            © 2025 BloodLink. All rights reserved. Built for saving lives globally.
          </p>
        </div>
      </div>
    </footer>
  );
}