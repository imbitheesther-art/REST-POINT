import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if auth token exists to allow onboarding
    const token = localStorage.getItem('authToken');
    if (!token) {
      // In a real app, maybe they just registered, but if no token, push to login
      // navigate('/login');
    }
  }, [navigate]);

  const completeOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="onboarding-container" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Welcome to RESTPOINT</h1>
      <div className="step-indicator">Step {step} of 3</div>
      
      {step === 1 && (
        <div className="step-content">
          <h2>Organization Setup</h2>
          <p>Let's get your organization details set up.</p>
          <input className="form-control" type="text" placeholder="Organization Name" style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px' }} />
          <button className="btn btn-primary" onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h2>Mortuary Details</h2>
          <p>Configure your mortuary specifics.</p>
          <input className="form-control" type="text" placeholder="Capacity" style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px' }} />
          <button className="btn btn-default" onClick={() => setStep(1)} style={{ marginRight: '10px' }}>Back</button>
          <button className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="step-content">
          <h2>Finish Setup</h2>
          <p>You are all set to start using the system.</p>
          <button className="btn btn-default" onClick={() => setStep(2)} style={{ marginRight: '10px' }}>Back</button>
          <button className="btn btn-primary" onClick={completeOnboarding}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
