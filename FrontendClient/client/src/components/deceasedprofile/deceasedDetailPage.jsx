import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  QrCode,
  RefreshCw,
  ArrowLeft,
  User,
  Info,
  AlertTriangle,
  CheckCircle,
  Users,
  Microscope,
  DollarSign,
  FileText,
  Box,
  Truck,
  Menu,
  X,
  Activity,
  LogOut,
  Settings,
} from 'lucide-react';
import styled from 'styled-components';

const BASE_URL = 'http://localhost:5000/api/v1/restpoint';

// Colors - Sleek modern palette
const Colors = {
  primaryDark: '#0f172a',
  accentRed: '#ef4444',
  accentBlue: '#3b82f6',
  lightGray: '#f8fafc',
  mediumGray: '#e2e8f0',
  darkGray: '#1e293b',
  chargeSetting: '#6b21a5',
  successGreen: '#10b981',
  dangerRed: '#dc2626',
  warningYellow: '#f59e0b',
  infoBlue: '#0ea5e9',
  textMuted: '#64748b',
  cardBg: '#ffffff',
  cardShadow: '0 1px 3px rgba(0,0,0,0.05)',
  borderColor: '#e2e8f0',
};

// Styled Components - Minimal padding, compact design
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${Colors.lightGray};
  padding: 0.25rem;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  color: ${Colors.darkGray};
`;

const ContentGrid = styled.div`
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;

  @media (min-width: 992px) {
    grid-template-columns: 60% 40%;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HeaderCard = styled.div`
  background: ${Colors.primaryDark};
  color: white;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  box-shadow: ${Colors.cardShadow};

  @media (max-width: 768px) {
    display: none;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: ${Colors.dangerRed};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.375rem;

  &:hover {
    color: ${Colors.infoBlue};
  }
`;

const Card = styled.div`
  background: ${Colors.cardBg};

  padding: 1rem 0.2rem;
`;

const CardTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${Colors.borderColor};
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: ${Colors.primaryDark};

  svg {
    stroke-width: 2;
    width: 16px;
    height: 16px;
  }
`;

const ClickableBadge = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background-color: ${(props) => props.bgColor};
  border: none;
  cursor: pointer;
  flex: 1;
  white-space: nowrap;

  svg {
    stroke-width: 2.5;
    width: 12px;
    height: 12px;
  }
`;

const BadgesContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 0.5rem;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 0.25rem;
  width: 100%;
`;

const HeaderTopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
`;

const NameChargesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const MobileNavButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  background: ${Colors.accentBlue};
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.375rem;
  cursor: pointer;

  &:hover {
    background: ${Colors.infoBlue};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNavOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9998;
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
`;

const MobileNavContainer = styled.div`
  position: fixed;
  top: 0;
  left: ${(props) => (props.isOpen ? '0' : '-100%')};
  width: 85%;
  max-width: 300px;
  height: 100vh;
  background: ${Colors.primaryDark};
  z-index: 9999;
  transition: left 0.3s ease;
  overflow-y: auto;
  padding: 0.75rem;
`;

const MobileNavHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${Colors.borderColor};
  margin-bottom: 0.75rem;

  h3 {
    color: white;
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
`;

const MobileNavSection = styled.div`
  margin-bottom: 1rem;

  h4 {
    color: ${Colors.infoBlue};
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
  }
`;

const MobileNavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 0.25rem;
  color: white;
  cursor: pointer;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 14px;
    height: 14px;
  }

  .badge {
    margin-left: auto;
    background: ${(props) => props.badgeColor || Colors.successGreen};
    color: white;
    padding: 0.125rem 0.375rem;
    border-radius: 1rem;
    font-size: 0.625rem;
    font-weight: 600;
  }
`;

// Lazy loaded components
const withErrorBoundary = (Component) => (props) => {
  try {
    return <Component {...props} />;
  } catch (error) {
    console.error('Component error:', error);
    return (
      <div style={{ padding: '0.5rem', color: Colors.dangerRed }}>Component failed to load</div>
    );
  }
};

const MortuaryProgress = lazy(() =>
  import('../user/mortuaryProgress').catch(() => ({
    default: () => <div>Progress not found</div>,
  })),
);
const CoffinAssignment = lazy(() =>
  import('../coffins/coffinAssignment').catch(() => ({
    default: () => <div>Coffin Assignment not found</div>,
  })),
);
const DeceasedInfoSection = lazy(() =>
  import('../deceasedinfo/deceasedInfoSection').catch(() => ({
    default: () => <div>Deceased Info not found</div>,
  })),
);
const PostmortemInfoSection = lazy(() =>
  import('../autopsy/postmortemSection').catch(() => ({
    default: () => <div>Postmortem Info not found</div>,
  })),
);
const NextOfKinSection = lazy(() =>
  import('../next-kin/nextOfKIn').catch(() => ({
    default: () => <div>Next of Kin not found</div>,
  })),
);
const DispatchSection = lazy(() =>
  import('../dispatch/dispatchSection').catch(() => ({
    default: () => <div>Dispatch not found</div>,
  })),
);
const DocumentUpload = lazy(() =>
  import('../documents/DocumentUpload').catch(() => ({
    default: () => <div>Document Upload not found</div>,
  })),
);
const Loader = lazy(() =>
  import('../../components/loader/loader').catch(() => ({
    default: () => <div>Loading...</div>,
  })),
);
const DeceasedInfoModal = lazy(() =>
  import('../user/modals/deceasedinfomodal').catch(() => ({
    default: () => null,
  })),
);
const NextOfKinModal = lazy(() =>
  import('../user/modals/nextofKinModal').catch(() => ({
    default: () => null,
  })),
);
const FinancialDetailsModal = lazy(() =>
  import('../user/modals/financialdetailsmodal').catch(() => ({
    default: () => null,
  })),
);
const PaymentHistoryModal = lazy(() =>
  import('../user/modals/paymenthistoryModals').catch(() => ({
    default: () => null,
  })),
);

const LoadingFallback = () => (
  <div
    style={{
      padding: '0.75rem',
      color: Colors.textMuted,
      textAlign: 'center',
      fontSize: '0.875rem',
    }}
  >
    <RefreshCw size={16} className="animate-spin" style={{ marginRight: '0.25rem' }} />
    Loading...
  </div>
);

const DeceasedDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coffins, setCoffins] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showDeceasedInfoModal, setShowDeceasedInfoModal] = useState(false);
  const [showNextOfKinModal, setShowNextOfKinModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);

  const showExternalLoader = () => setShowLoader(true);
  const hideExternalLoader = () => setShowLoader(false);

  const navigateToReleaseForm = () => {
    showExternalLoader();
    setTimeout(() => {
      if (deceasedData) {
        hideExternalLoader();
        navigate(`/release-form/${getDeceasedId()}`, {
          state: { deceasedData },
        });
      } else {
        hideExternalLoader();
        toast.error('Unable to load deceased data');
      }
    }, 500);
  };

  const fetchDeceasedData = async () => {
    setIsLoading(true);
    try {
      let response = await axios.get(`${BASE_URL}/deceased-id?id=${id}`);
      const apiData = response.data.data || {};

      const normalizedData = {
        ...apiData,
        deceased_id: apiData.deceased_id || apiData.id || apiData._id || id,
        full_name: apiData.full_name || 'Unknown',
        total_mortuary_charge: apiData.total_mortuary_charge || 0,
        currency: apiData.currency || 'KES',
        burial_type: apiData.burial_type || 'Burial',
        next_of_kin: apiData.next_of_kin || [],
        documents: apiData.documents || [],
        charges: apiData.charges || [],
        postmortem: apiData.postmortem || null,
        dispatch: apiData.dispatch || null,
      };

      setDeceasedData(normalizedData);
      toast.success('Data loaded');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load details');
      setDeceasedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoffins = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/all-coffins`);
      setCoffins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching coffins:', error);
    }
  };

  useEffect(() => {
    fetchDeceasedData();
    fetchCoffins();
  }, [id]);

  const handleDocumentUploadSuccess = () => {
    toast.success('Document uploaded');
    fetchDeceasedData();
  };

  const calculateAge = (dob, dod) => {
    if (!dob || !dod) return { years: 'N/A', category: 'Unknown' };
    const birthDate = new Date(dob);
    const deathDate = new Date(dod);

    let years = deathDate.getFullYear() - birthDate.getFullYear();
    const m = deathDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && deathDate.getDate() < birthDate.getDate())) years--;

    let category = 'Unknown';
    if (years < 13) category = 'Child';
    else if (years < 18) category = 'Teenager';
    else if (years < 25) category = 'Young Adult';
    else if (years < 40) category = 'Adult';
    else if (years < 60) category = 'Middle-Aged';
    else category = 'Elderly';

    return { years, category };
  };

  const getDaysInMortuary = (admissionDate) => {
    if (!admissionDate) return 0;
    const admitted = new Date(admissionDate);
    const today = new Date();
    const diffTime = today - admitted;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysInMortuary = getDaysInMortuary(deceasedData?.date_admitted);
  const getDeceasedId = () => deceasedData?.deceased_id || deceasedData?.id || id;
  const currentDeceasedId = getDeceasedId();
  const ageInfo = calculateAge(deceasedData?.date_of_birth, deceasedData?.date_of_death);

  const mobileNavItems = {
    information: [
      {
        icon: <Info size={14} />,
        label: 'Deceased Info',
        action: () => setShowDeceasedInfoModal(true),
        badge: 'View',
      },
      {
        icon: <Users size={14} />,
        label: 'Next of Kin',
        action: () => setShowNextOfKinModal(true),
        badge: deceasedData?.next_of_kin?.length || 0,
      },
    ],
    actions: [
      {
        icon: <QrCode size={14} />,
        label: 'QR Code',
        action: () => navigate(`/qr-code/${currentDeceasedId}`),
        badge: 'View',
      },
      {
        icon: <DollarSign size={14} />,
        label: 'Financial',
        action: () => setShowFinancialModal(true),
        badge: 'View',
      },
      {
        icon: <FileText size={14} />,
        label: 'Documents',
        action: () => navigate(`/documents/${currentDeceasedId}`),
        badge: deceasedData?.documents?.length || 0,
      },
      {
        icon: <LogOut size={14} />,
        label: 'Release Form',
        action: navigateToReleaseForm,
        badge: 'New',
      },
    ],
  };

  const primaryBadges = [
    {
      text: `Status`,
      color: daysInMortuary > 30 ? Colors.dangerRed : Colors.dangerRed,
      icon: daysInMortuary > 30 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />,
      onClick: () => setShowDeceasedInfoModal(true),
    },
    {
      text: `Charges`,
      color: Colors.accentBlue,
      icon: <DollarSign size={12} />,
    },
  ];

  const secondaryBadges = [
    {
      text: 'Charge Settings',
      color: Colors.chargeSetting,
      icon: <Settings size={12} />,
      onClick: () => navigate(`/charge-settings/${currentDeceasedId}`),
    },
    {
      text: 'Documents',
      color: Colors.warningYellow,
      icon: <FileText size={12} />,
      onClick: () => navigate(`/documents/${currentDeceasedId}`),
    },
    {
      text: 'Release Form',
      color: Colors.successGreen,
      icon: <LogOut size={12} />,
      onClick: navigateToReleaseForm,
    },
  ];

  if (isLoading && !showLoader) {
    return (
      <AppContainer
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <RefreshCw size={32} color={Colors.accentBlue} className="animate-spin" />
      </AppContainer>
    );
  }

  if (!deceasedData && !isLoading) {
    return (
      <AppContainer style={{ padding: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle size={32} color={Colors.dangerRed} />
          <h3 style={{ margin: '0.5rem 0' }}>Failed to load details</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>ID: {id}</p>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Go Back
          </BackButton>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <ToastContainer position="top-right" autoClose={2000} />

      {showLoader && (
        <Suspense fallback={null}>
          <Loader message="Loading..." />
        </Suspense>
      )}

      <MobileNavOverlay isOpen={mobileNavOpen} onClick={() => setMobileNavOpen(false)} />
      <MobileNavContainer isOpen={mobileNavOpen}>
        <MobileNavHeader>
          <h3>Quick Actions</h3>
          <MobileNavButton onClick={() => setMobileNavOpen(false)}>
            <X size={18} />
          </MobileNavButton>
        </MobileNavHeader>
        {Object.entries(mobileNavItems).map(([section, items]) => (
          <MobileNavSection key={section}>
            <h4>{section === 'information' ? 'Information' : 'Actions'}</h4>
            {items.map((item, index) => (
              <MobileNavItem
                key={index}
                onClick={() => {
                  item.action();
                  setMobileNavOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </MobileNavItem>
            ))}
          </MobileNavSection>
        ))}
      </MobileNavContainer>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.25rem',
          gap: '0.25rem',
        }}
      >
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </BackButton>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <BackButton onClick={() => window.location.reload()}>
            <RefreshCw size={14} /> Refresh
          </BackButton>
          <MobileNavButton onClick={() => setMobileNavOpen(true)}>
            <Menu size={18} />
          </MobileNavButton>
        </div>
      </div>

      <HeaderCard>
        <HeaderTopSection>
          <NameChargesContainer>
            <h2
              style={{
                margin: 0,
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                fontSize: '1.1rem',
              }}
            >
              <User size={16} /> {deceasedData?.full_name}
            </h2>
            <div style={{ fontSize: '0.875rem' }}>
              Total: {deceasedData?.total_mortuary_charge} {deceasedData?.currency}
            </div>
          </NameChargesContainer>
        </HeaderTopSection>

        <BadgesContainer>
          <BadgeRow>
            <ClickableBadge bgColor={Colors.warningYellow} style={{ minWidth: '60px' }}>
              🪦 {deceasedData?.burial_type}
            </ClickableBadge>
            {primaryBadges.map((badge, index) => (
              <ClickableBadge key={index} bgColor={badge.color} onClick={badge.onClick}>
                {badge.icon} {badge.text}
              </ClickableBadge>
            ))}
          </BadgeRow>
          <BadgeRow>
            {secondaryBadges.map((badge, index) => (
              <ClickableBadge key={index} bgColor={badge.color} onClick={badge.onClick}>
                {badge.icon} {badge.text}
              </ClickableBadge>
            ))}
          </BadgeRow>
        </BadgesContainer>
      </HeaderCard>

      <ContentGrid>
        <MainContent>
          <Card>
            <CardTitle>
              <Info size={14} /> Deceased Information
            </CardTitle>
            <Suspense fallback={<LoadingFallback />}>
              <DeceasedInfoSection
                deceasedId={currentDeceasedId}
                deceased={deceasedData}
                ageInfo={ageInfo}
                onUpdate={fetchDeceasedData}
              />
            </Suspense>
          </Card>

          <Card>
            <CardTitle>
              <Microscope size={14} /> Postmortem Information
            </CardTitle>
            <Suspense fallback={<LoadingFallback />}>
              <PostmortemInfoSection
                deceasedId={currentDeceasedId}
                deceased={deceasedData}
                onUpdate={fetchDeceasedData}
              />
            </Suspense>
          </Card>

          <Card>
            <CardTitle>
              <Users size={14} /> Next of Kin
            </CardTitle>
            <Suspense fallback={<LoadingFallback />}>
              <NextOfKinSection
                deceasedId={currentDeceasedId}
                nextOfKin={deceasedData?.next_of_kin}
                onUpdate={fetchDeceasedData}
              />
            </Suspense>
          </Card>

          <Card>
            <CardTitle>
              <FileText size={14} /> Documents
            </CardTitle>
            <Suspense fallback={<LoadingFallback />}>
              <DocumentUpload
                deceasedId={currentDeceasedId}
                deceasedData={deceasedData}
                onUploadSuccess={handleDocumentUploadSuccess}
              />
            </Suspense>
          </Card>
        </MainContent>

        <SidebarContent>
          <Card>
            <CardTitle>
              <Activity size={14} /> Progress
            </CardTitle>
            <Suspense fallback={<LoadingFallback />}>
              <MortuaryProgress
                daysInMortuary={daysInMortuary}
                dispatchDate={deceasedData?.dispatch_date}
                isOverdue={daysInMortuary > 30}
              />
            </Suspense>
          </Card>

          <Card>
            <CardTitle>
              <Box size={14} /> Coffin Assignment
            </CardTitle>
            <Suspense fallback={<LoadingFallback />}>
              <CoffinAssignment
                deceasedId={currentDeceasedId}
                deceasedData={deceasedData}
                coffins={coffins}
                onUpdate={fetchDeceasedData}
              />
            </Suspense>
          </Card>

          <Card>
            <CardTitle>
              <Truck size={14} /> Dispatch
            </CardTitle>
            <Suspense fallback={<LoadingFallback />}>
              <DispatchSection
                deceasedId={currentDeceasedId}
                dispatchData={deceasedData?.dispatch}
                onUpdate={fetchDeceasedData}
              />
            </Suspense>
          </Card>
        </SidebarContent>
      </ContentGrid>

      <Suspense fallback={null}>
        {showDeceasedInfoModal && (
          <DeceasedInfoModal
            isOpen={showDeceasedInfoModal}
            onClose={() => setShowDeceasedInfoModal(false)}
            deceased={deceasedData}
            ageInfo={ageInfo}
          />
        )}
        {showNextOfKinModal && (
          <NextOfKinModal
            isOpen={showNextOfKinModal}
            onClose={() => setShowNextOfKinModal(false)}
            nextOfKin={deceasedData?.next_of_kin}
          />
        )}
        {showFinancialModal && (
          <FinancialDetailsModal
            isOpen={showFinancialModal}
            onClose={() => setShowFinancialModal(false)}
            deceasedData={deceasedData}
          />
        )}
        {showPaymentHistoryModal && (
          <PaymentHistoryModal
            isOpen={showPaymentHistoryModal}
            onClose={() => setShowPaymentHistoryModal(false)}
            deceasedData={deceasedData}
            deceasedId={currentDeceasedId}
          />
        )}
      </Suspense>
    </AppContainer>
  );
};

export default DeceasedDetails;
