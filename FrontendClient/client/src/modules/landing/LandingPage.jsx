import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      title: 'Deceased Records & QR Tracking',
      description: 'Fully digitize admissions, secure tagging, and immediate QR-code generation for tracking deceased records across your branches.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1.005 1.005 0 001-1V5a1.005 1.005 0 00-1-1H5a1.005 1.005 0 00-1 1v2a1.005 1.005 0 001 1zm0 12h2a1.005 1.005 0 001-1v-2a1.005 1.005 0 00-1-1H5a1.005 1.005 0 00-1 1v2a1.005 1.005 0 001 1zm12-12h2a1.005 1.005 0 001-1V5a1.005 1.005 0 00-1-1h-2a1.005 1.005 0 00-1 1v2a1.005 1.005 0 001 1z" />
        </svg>
      )
    },
    {
      title: 'Embalming & Autopsy Workflows',
      description: 'Streamline embalming progress, chemical inventory levels, autopsy logs, and post-mortem certificate generation.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: 'Hearse Fleet & Logistics',
      description: 'Book vehicles, dispatch drivers with route coordinates, log kilometers, and monitor hearse service maintenance.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    },
    {
      title: 'Smart Billing & Invoices',
      description: 'Generate itemized billing, handle automated storage pricing, manage deposits, and reconcile local payments like M-Pesa.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Analytics & Compliance',
      description: 'Access total deceased occupancies, dispatch counts, revenue breakdowns, and compliance monitoring logs.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Multi-Branch Operations',
      description: 'Isolate tenant branches, secure custom branding stylesheets, and control roles for family communication managers.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  const faqs = [
    {
      q: "Does Montezuma ERP support offline data syncing?",
      a: "Yes. Our client application caches essential deceased registration forms locally so you can continue records operations during service dropouts and automatically sync when connection returns."
    },
    {
      q: "How does the multi-branch tenant isolation work?",
      a: "Each mortuary branch gets a custom tenant slug. This ensures complete database isolation, distinct billing policies, and dedicated hearse fleet managers, while allowing administrators global analytics reports."
    },
    {
      q: "Is it compliant with local Kenyan hospital/mortuary rules?",
      a: "Absolutely. Montezuma provides fields and reporting formats aligned with local laws, including burial permit tracking, formal tags, and medical cause logs."
    }
  ];

  return (
    <div style={{
      backgroundColor: '#0a0b10',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* HEADER NAV */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(10, 11, 16, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* BRAND */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#ffffff'
            }}>M</div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              background: 'linear-gradient(to right, #ffffff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>MONTEZUMA <span style={{ color: '#6366f1', fontSize: '0.9rem', fontWeight: 600 }}>ERP</span></span>
          </div>

          {/* MENU LINKS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
            <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Pricing</a>
            <a href="#faq" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>FAQ</a>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.5rem 1.25rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'transform 0.2s'
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        padding: '8rem 2rem 6rem 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0
        }}></div>

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            color: '#818cf8',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '2rem'
          }}>
            <span>✨ Introducing Montezuma v2.0 RESTPOINT</span>
          </div>

          <h1 style={{
            fontSize: '3.75rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
            background: 'linear-gradient(to right, #ffffff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Modern Mortuary Management & Enterprise ERP
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '3rem',
            maxWidth: '650px',
            margin: '0 auto 3rem auto'
          }}>
            Streamline admissions, automated embalming workflows, hearse fleet scheduling, itemized invoices, and multi-branch compliance in one beautifully intuitive cloud dashboard.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.875rem 2.25rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)'
              }}
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.875rem 2.25rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section style={{
        padding: '0 2rem 6rem 2rem',
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 21, 28, 0.9) 0%, rgba(13, 14, 19, 0.9) 100%)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          {/* Header bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
              <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>MONTEZUMA ERP • LIVE SYSTEM DEMO</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
              Connected to database
            </div>
          </div>

          {/* Dummy dashboard preview grids */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {[
              { label: 'Total Occupancy', value: '42 cases', desc: '84% Capacity', color: '#6366f1' },
              { label: 'Active Embalmings', value: '8 bodies', desc: 'Under processing', color: '#10b981' },
              { label: 'Hearse Fleet Status', value: '3 / 5 online', desc: 'Logistics tracking active', color: '#f59e0b' },
              { label: 'Unpaid Invoices', value: 'KES 485,000', desc: 'Reconciliation pending', color: '#ec4899' }
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '1.25rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{stat.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, marginBottom: '0.25rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* Graph visual */}
          <div style={{
            height: '200px',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '1.5rem',
            gap: '0.5rem'
          }}>
            {[45, 60, 48, 70, 58, 85, 68, 92, 80, 75, 88, 98].map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
                <div style={{
                  width: '100%',
                  height: `${h}px`,
                  background: 'linear-gradient(to top, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8))',
                  borderRadius: '0.25rem'
                }}></div>
                <span style={{ fontSize: '0.7rem', color: '#475569' }}>M{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{
        padding: '6rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Engineered for Enterprise Compliance</h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>All operational components connected securely to dedicated SQL databases with active tenant shielding and full event audits.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '2rem',
              borderRadius: '0.75rem',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                width: '3rem',
                height: '3rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                color: '#6366f1'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{feature.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" style={{
        padding: '6rem 2rem',
        maxWidth: '1000px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Transparent Scale-based Pricing</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Choose a plan that fits your clinic or multi-location mortuary organization.</p>

          <div style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            padding: '0.25rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button 
              onClick={() => setBillingPeriod('monthly')}
              style={{
                backgroundColor: billingPeriod === 'monthly' ? '#6366f1' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingPeriod('yearly')}
              style={{
                backgroundColor: billingPeriod === 'yearly' ? '#6366f1' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch'
        }}>
          {[
            {
              title: "Starter Branch",
              price: billingPeriod === 'monthly' ? "15,000" : "12,000",
              desc: "Perfect for single branch clinics and mortuaries.",
              features: ["Up to 50 active cases/mo", "Basic QR tracking cards", "Direct M-Pesa billing", "Email alerts", "1 admin + 3 staff"]
            },
            {
              title: "Enterprise Hub",
              price: billingPeriod === 'monthly' ? "35,000" : "28,000",
              desc: "Designed for full operations with multi-branch analytics.",
              popular: true,
              features: ["Unlimited active cases", "Interactive embalming logs", "Hearse booking coordinates", "Auto cold room assignment", "Unlimited administrators"]
            }
          ].map((plan, i) => (
            <div key={i} style={{
              background: plan.popular ? 'linear-gradient(135deg, rgba(30, 32, 54, 0.9) 0%, rgba(13, 14, 19, 0.9) 100%)' : 'rgba(255, 255, 255, 0.02)',
              border: plan.popular ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              {plan.popular && (
                <span style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 1rem',
                  borderRadius: '9999px'
                }}>MOST POPULAR</span>
              )}
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{plan.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{plan.desc}</p>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800 }}>KES {plan.price}</span>
                <span style={{ color: '#64748b' }}> / month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flexGrow: 1 }}>
                {plan.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    <svg className="w-5 h-5 text-indigo-400" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/register')}
                style={{
                  background: plan.popular ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Choose {plan.title}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" style={{
        padding: '6rem 2rem',
        maxWidth: '800px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              cursor: 'pointer'
            }} onClick={() => toggleFaq(idx)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{faq.q}</span>
                <span style={{ fontSize: '1.25rem', color: '#6366f1' }}>{activeFaq === idx ? '−' : '+'}</span>
              </div>
              {activeFaq === idx && (
                <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '0.95rem', lineHeight: 1.5 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#07080c',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '4rem 2rem 2rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>MONTEZUMA <span style={{ color: '#6366f1' }}>ERP</span></span>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1rem', lineHeight: 1.5 }}>Modern operational suites for Kenyan mortuary compliance, vehicle dispatches, and QR logistics.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: '1rem', fontWeight: 700 }}>System Services</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li><a href="#features" style={{ color: '#64748b', textDecoration: 'none' }}>Deceased Management</a></li>
              <li><a href="#features" style={{ color: '#64748b', textDecoration: 'none' }}>Embalming Tracker</a></li>
              <li><a href="#features" style={{ color: '#64748b', textDecoration: 'none' }}>Hearse Logistics</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: '1rem', fontWeight: 700 }}>Legal & Compliance</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a></li>
              <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#475569' }}>&copy; 2026 Montezuma ERP. All rights reserved. Registered Restpoint System.</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>Support</span>
            <span style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
