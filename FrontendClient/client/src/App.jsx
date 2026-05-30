import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './modules/landing/LandingPage';
import OnboardingFlow from './modules/onboarding/OnboardingFlow';
// We'll add Onboarding and Dashboard layouts later
// import DashboardLayout from './modules/dashboard/DashboardLayout';

const App = () => {
  // Simple check for tenant subdomain
  const hostname = window.location.hostname;
  const isTenantSubdomain = hostname !== 'localhost' && hostname !== 'restpoint.co.ke' && !hostname.startsWith('www.');

  return (
    <BrowserRouter>
      <Routes>
        {isTenantSubdomain ? (
          <>
            {/* 
              If we are on a tenant subdomain, the root route should go to the dashboard or tenant-specific landing.
              For now, redirecting to dashboard.
            */}
            {/* <Route path="/" element={<DashboardLayout />} /> */}
            <Route path="*" element={<div>Tenant Dashboard Placeholder</div>} />
          </>
        ) : (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<OnboardingFlow />} />
            {/* Tenant slug route support: e.g. /t/lee-funeral/dashboard */}
            {/* <Route path="/t/:tenantSlug/*" element={<DashboardLayout />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;