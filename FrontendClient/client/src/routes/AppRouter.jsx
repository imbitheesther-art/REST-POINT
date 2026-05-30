import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { useTenantStore } from '../store/useTenantStore';
import { tenantApi } from '../api/tenant.api';

import LandingPage from '../modules/landing/LandingPage';
import OnboardingFlow from '../modules/onboarding/OnboardingFlow';

// Placeholder Auth
const AuthPage = () => <div className="auth"><h1>Login</h1></div>;

const DashboardLayout = ({ children }) => {
  const { tenantData, features } = useTenantStore();
  
  return (
    <div className="dashboard-container" style={{ '--primary-color': tenantData?.primaryColor || '#000' }}>
      <aside className="sidebar">
        <h2>{tenantData?.name || 'Dashboard'}</h2>
        <nav>
          <ul>
            <li>Overview</li>
            {features.hearseTracking && <li>Hearse Tracking</li>}
            {features.invoicing && <li>Invoices</li>}
          </ul>
        </nav>
      </aside>
      <main className="dashboard-content">{children}</main>
    </div>
  );
};

const TenantDashboard = () => <div><h2>Welcome to the dashboard.</h2></div>;

// Component to handle the dynamic slug resolution
const TenantResolver = ({ children }) => {
  const { slug } = useParams();
  const { setTenantData, setLoading, error, setError } = useTenantStore();

  useEffect(() => {
    const fetchTenant = async () => {
      setLoading(true);
      try {
        const data = await tenantApi.getBranding(slug);
        setTenantData(data);
        
        // Apply CSS variables to root for theming
        document.documentElement.style.setProperty('--tenant-primary', data.primaryColor);
        document.title = `${data.name} | RESTPOINT`;
      } catch (err) {
        setError('Tenant not found');
      }
    };
    
    if (slug) fetchTenant();
  }, [slug, setTenantData, setLoading, setError]);

  if (error) return <div>{error}</div>;
  
  // You would also check auth here. If not authed, redirect to login.
  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<OnboardingFlow />} />
        <Route path="/t/:slug/login" element={<AuthPage />} />
        
        {/* Tenant Routes */}
        <Route path="/t/:slug/*" element={<TenantResolver><TenantDashboard /></TenantResolver>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
