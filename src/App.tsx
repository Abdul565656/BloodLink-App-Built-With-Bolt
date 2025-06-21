import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DonorRegistrationForm from './components/DonorRegistrationForm';
import BloodRequestForm from './components/BloodRequestForm';
import HowItWorksPage from './components/HowItWorksPage';
import GetInvolvedPage from './components/GetInvolvedPage';
import AdminDashboard from './components/AdminDashboard';
import KhoonBuddyChat from './components/KhoonBuddyChat';
import BloodRequestHeatmap from './components/BloodRequestHeatmap';
import NearbyDonorsMap from './components/NearbyDonorsMap';
import NearbyBloodBanks from './components/NearbyBloodBanks';
import { Toaster } from './components/Toaster';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/donate" element={<DonorRegistrationForm />} />
          <Route path="/request" element={<BloodRequestForm />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/get-involved" element={<GetInvolvedPage />} />
          <Route path="/heatmap" element={<BloodRequestHeatmap />} />
          <Route path="/nearby-donors" element={<NearbyDonorsMap />} />
          <Route path="/nearby-blood-banks" element={<NearbyBloodBanks />} />
          
          {/* Admin Route */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global Components */}
        <KhoonBuddyChat />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;