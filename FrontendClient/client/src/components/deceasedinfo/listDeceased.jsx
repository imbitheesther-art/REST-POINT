import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  PlusCircle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Users,
  Microscope,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  Calendar,
  Filter,
  Smartphone,
  FileText,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

// --- BOLD, HIGH-CONTRAST Color Palette (Version 4: Updated Status/Refresh Colors) ---
const Colors = {
  // Base Colors
  primaryDark: '#2C3E50',
  accentBlue: '#1e293b',
  white: '#FFFFFF',
  lightGray: '#F7F9FB',
  mediumGray: '#E9ECEF',
  darkGray: '#1e293b',

  // Status Colors - BOLD and DISTINCT
  successGreen: '#1DB954',
  dangerRed: '#C0392B', // Used for Refresh Button and main Danger color

  // Distinct Colors for Kin/Autopsy Ticks
  kinSuccess: '#00A896',
  kinDanger: '#E71D36',
  autopsySuccess: '#6A0572',
  autopsyDanger: '#FF9F1C',

  warningYellow: '#F39C12',
  infoBlue: '#1e293b',
  tableBorder: '#E9ECEF',
  headerBg: '#1e293b',
  hoverGray: '#F0F3F5',

  // Updated Status Pill Colors based on new workflow: Received, underCare, Ready, Completed
  statusReceived: '#6A0572', // Deep Purple for start status
  statusUnderCare: '#F39C12', // Warning Yellow for in-progress
  statusReady: '#1DB954', // Accent Blue for ready state
  statusCompleted: '#C0392B', // Danger Red (as requested for the refresh button, now used for completed)
};

// --- Keyframe Animations ---
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Shared Styled Components ---
const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${Colors.lightGray};
  padding: 0rem 0rem;
  font-family: 'Inter', sans-serif;
  animation: ${fadeIn} 0.6s ease-out;
`;

const ContentWrapper = styled.div`
  max-width: 1800px;
  width: 98%;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${Colors.primaryDark};
  letter-spacing: -0.05em;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: ${Colors.accentBlue};
    font-size: 2.5rem;
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;

    svg {
      font-size: 2rem;
    }
  }
`;

const PrimaryButton = styled.button`
  ${({ refresh }) =>
    refresh &&
    css`
      background-color: ${Colors.dangerRed};
      box-shadow: 0 2px 5px rgba(192, 57, 43, 0.2);
      &:hover {
        background-color: #a93226;
        box-shadow: 0 4px 8px rgba(192, 57, 43, 0.3);
      }
    `}
  ${({ primary }) =>
    primary &&
    css`
      background-color: ${Colors.accentBlue};
      box-shadow: 0 2px 5px rgba(5, 102, 141, 0.2);
      &:hover {
        background-color: #04597b;
        box-shadow: 0 4px 8px rgba(5, 102, 141, 0.3);
      }
    `}

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 0.9rem;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${Colors.white};
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateY(0);

  &:hover {
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  svg {
    margin-right: 0.5rem;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;

    svg {
      margin-right: 0.3rem;
      font-size: 1rem;
    }
  }
`;

const ReportButton = styled(PrimaryButton)`
  background-color: #6a0572;
  box-shadow: 0 2px 5px rgba(106, 5, 114, 0.2);

  &:hover {
    background-color: #5a0462;
    box-shadow: 0 4px 8px rgba(106, 5, 114, 0.3);
  }
`;

const StyledCard = styled.div`
  background-color: ${Colors.white};
  border-radius: 0.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid ${Colors.tableBorder};
`;

// Updated Filter Container with mobile support
const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background-color: ${Colors.white};
  border-radius: 0.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex-wrap: nowrap;
  overflow-x: auto;
  white-space: nowrap;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${Colors.mediumGray};
  }

  &::-webkit-scrollbar-thumb {
    background: ${Colors.accentBlue};
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
    padding: 0.8rem;

    ${({ showFilters }) =>
      !showFilters &&
      css`
        display: none;
      `}
  }
`;

const MobileFilterToggle = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem 1rem;
    background-color: ${Colors.white};
    border-radius: 0.8rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    font-weight: 600;
    color: ${Colors.primaryDark};

    svg {
      color: ${Colors.accentBlue};
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    justify-content: space-between;

    &:not(:first-child) {
      border-top: 1px solid ${Colors.mediumGray};
      padding-top: 0.8rem;
    }
  }
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: ${Colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  white-space: nowrap;

  svg {
    color: ${Colors.accentBlue};
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    min-width: 80px;
    font-size: 0.8rem;
  }
`;

const InputStyle = css`
  padding: 0.6rem 0.8rem;
  border: 1px solid ${Colors.mediumGray};
  border-radius: 0.4rem;
  font-size: 0.85rem;
  color: ${Colors.darkGray};
  transition: all 0.3s ease-in-out;
  background-color: ${Colors.white};

  &:focus {
    outline: none;
    border-color: ${Colors.accentBlue};
    box-shadow: 0 0 0 3px rgba(5, 102, 141, 0.15);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.7rem;
    font-size: 0.8rem;
  }
`;

const YearFilterInput = styled.div`
  position: relative;
  min-width: 120px;
  max-width: 140px;

  input {
    ${InputStyle}
    width: 100%;
    padding-right: 0.75rem;
  }

  .year-select-container {
    position: relative;
    display: flex;
  }

  select {
    ${InputStyle}
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 10;
    appearance: none;
  }

  @media (max-width: 768px) {
    min-width: 100px;
    max-width: 120px;
  }
`;

const SearchInput = styled(YearFilterInput)`
  min-width: 200px;
  input {
    padding: 0.6rem 0.8rem 0.6rem 2.2rem;
  }
  svg {
    position: absolute;
    left: 0.7rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${Colors.darkGray};
    font-size: 1.1rem;
    z-index: 5;
  }

  @media (max-width: 768px) {
    min-width: 150px;
  }
`;

const FilterSelect = styled.select`
  ${InputStyle}
  padding-right: 2rem;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  min-width: 120px;

  @media (max-width: 768px) {
    min-width: 100px;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead th {
    background-color: ${Colors.headerBg};
    color: ${Colors.white};
    padding: 0.8rem 1rem;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: left;
    border-bottom: 2px solid ${Colors.accentBlue};

    &:first-child {
      border-top-left-radius: 0.8rem;
    }
    &:last-child {
      border-top-right-radius: 0.8rem;
    }
    &.text-center {
      text-align: center;
    }
  }

  tbody tr {
    background-color: ${Colors.white};
    transition: all 0.2s ease-in-out;
    border-bottom: 1px solid ${Colors.tableBorder};

    &:hover {
      background-color: ${Colors.hoverGray};
    }

    td {
      padding: 0.8rem 1rem;
      color: ${Colors.darkGray};
      font-size: 0.85rem;
      font-weight: 500;
      vertical-align: middle;

      &:nth-child(2) {
        color: #6c757d; /* Duller color for Admission No */
        font-weight: 400;
      }
    }
  }

  @media (max-width: 768px) {
    thead {
      display: none;
    }

    tbody tr {
      display: block;
      margin-bottom: 1rem;
      border: 1px solid ${Colors.tableBorder};
      border-radius: 0.6rem;
      padding: 1rem;
    }

    tbody td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border: none;
      font-size: 0.8rem;

      &:before {
        content: attr(data-label);
        font-weight: 700;
        color: ${Colors.primaryDark};
        text-transform: uppercase;
        font-size: 0.75rem;
        min-width: 80px;
      }

      &.mobile-full {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;

        &:before {
          align-self: flex-start;
        }
      }
    }
  }
`;

// Status Icon for Kin/Autopsy Checkmarks
const StatusIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin: auto;

  background-color: ${(props) => {
    const statusColor =
      props.status === 'success'
        ? props.type === 'kin'
          ? Colors.kinSuccess
          : props.type === 'autopsy'
            ? Colors.autopsySuccess
            : Colors.successGreen
        : props.type === 'kin'
          ? Colors.kinDanger
          : props.type === 'autopsy'
            ? Colors.autopsyDanger
            : Colors.dangerRed;

    return `${statusColor}1A`;
  }};

  svg {
    color: ${(props) => {
      return props.status === 'success'
        ? props.type === 'kin'
          ? Colors.kinSuccess
          : props.type === 'autopsy'
            ? Colors.autopsySuccess
            : Colors.successGreen
        : props.type === 'kin'
          ? Colors.kinDanger
          : props.type === 'autopsy'
            ? Colors.autopsyDanger
            : Colors.dangerRed;
    }};
    font-size: 1.2rem;
    font-weight: 900;
  }

  @media (max-width: 768px) {
    width: 1.8rem;
    height: 1.8rem;

    svg {
      font-size: 1rem;
    }
  }
`;

// StatusPill Component for direct status text - UPDATED LOGIC
const StatusPill = styled.span`
  display: inline-flex;
  padding: 0.3rem 0.6rem;
  border-radius: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.02em;
  white-space: nowrap;

  ${({ status }) => {
    let bgColor, textColor;

    // --- UPDATED STATUS MAPPING ---
    switch (status ? status.toLowerCase() : '') {
      case 'received':
      case 'new':
        bgColor = Colors.statusReceived;
        textColor = Colors.white;
        break;
      case 'undercare':
      case 'pending':
      case 'inprogress':
        bgColor = Colors.statusUnderCare;
        textColor = Colors.darkGray;
        break;
      case 'ready':
      case 'awaitingcollection':
        bgColor = Colors.statusReady;
        textColor = Colors.white;
        break;
      case 'completed':
      case 'released':
      case 'discharged':
        bgColor = Colors.statusCompleted;
        textColor = Colors.white;
        break;
      default:
        bgColor = Colors.mediumGray;
        textColor = Colors.darkGray;
    }

    return css`
      background-color: ${bgColor};
      color: ${textColor};
    `;
  }}

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }
`;

// --- Status Summary Component - Updated for clickable status filters ---

const AnimatedLoader2 = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const ViewDetailsButton = styled(PrimaryButton)`
  padding: 0.5rem 0.8rem;
  font-size: 0.75rem;
  border-radius: 0.4rem;
  background-color: ${Colors.infoBlue};
  box-shadow: 0 1px 5px rgba(52, 152, 219, 0.15);

  &:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(52, 152, 219, 0.25);
  }

  svg {
    margin-right: 0.3rem;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 0.6rem;
    font-size: 0.8rem;
  }
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background-color: ${Colors.warningYellow}20;
  border-left: 4px solid ${Colors.warningYellow};
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  color: ${Colors.darkGray};
  font-weight: 500;
  animation: ${fadeIn} 0.5s ease-out;
  white-space: nowrap;
  font-size: 0.85rem;

  svg {
    color: ${Colors.warningYellow};
    font-size: 1.2rem;
  }
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  gap: 1.5rem;
  color: ${Colors.darkGray};
`;

// Updated Paginator for side-by-side layout - MOVED TO TOP
const Paginator = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background-color: ${Colors.white};
  border-radius: 0.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid ${Colors.tableBorder};
  border-bottom: 2px solid ${Colors.accentBlue};
  flex-wrap: nowrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.8rem;
    align-items: stretch;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: nowrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const PaginationButton = styled.button`
  background-color: ${(props) => (props.active ? Colors.accentBlue : Colors.white)};
  color: ${(props) => (props.active ? Colors.white : Colors.darkGray)};
  border: 1px solid ${(props) => (props.active ? Colors.accentBlue : Colors.mediumGray)};
  border-radius: 0.3rem;
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${Colors.accentBlue}20;
    color: ${Colors.accentBlue};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

// Compact items per page selector
const ItemsPerPageSelect = styled(FilterSelect)`
  min-width: 70px;
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
`;

// Mobile Card View for deceased records
const MobileCard = styled.div`
  background-color: ${Colors.white};
  border-radius: 0.8rem;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid ${Colors.tableBorder};
  animation: ${fadeIn} 0.3s ease-out;
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid ${Colors.mediumGray};
`;

const MobileCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${Colors.primaryDark};
  margin: 0;
  flex: 1;
`;

const MobileCardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MobileDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;

  .label {
    font-weight: 600;
    color: ${Colors.primaryDark};
    min-width: 80px;
  }

  .value {
    color: ${Colors.darkGray};
    font-weight: 500;
    text-align: right;
    flex: 1;
  }
`;

const MobileStatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.8rem 0;
`;

// Report Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${Colors.white};
  padding: 2rem;
  border-radius: 0.8rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.h2`
  color: ${Colors.primaryDark};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

// --- Utility Functions ---
const extractYear = (dateString) => {
  if (!dateString) return null;
  try {
    const year = new Date(dateString).getFullYear().toString();
    return year === 'NaN' ? null : year;
  } catch (e) {
    return null;
  }
};

// Date utility functions for report generation
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  let end = new Date();

  switch (period) {
    case 'thisMonth':
      start.setDate(1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'lastMonth':
      start.setMonth(now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'thisQuarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      break;
    case 'lastQuarter':
      const lastQuarter = Math.floor((now.getMonth() - 3) / 3);
      start.setMonth(lastQuarter * 3, 1);
      end = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0);
      break;
    case 'thisYear':
      start.setMonth(0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      break;
    case 'lastYear':
      start.setFullYear(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
      break;
    case 'all':
    default:
      return { startDate: null, endDate: null };
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

// --- Main Deceased List Component ---
const AllDeceasedPage = () => {
  const navigate = useNavigate();
  const [allDeceasedRecords, setAllDeceasedRecords] = useState([]);
  const [filteredDeceasedRecords, setFilteredDeceasedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [autopsyFilter, setAutopsyFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check if mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoized list of unique years for the filter dropdown
  const uniqueYears = useMemo(() => {
    const years = allDeceasedRecords
      .map((record) => extractYear(record.created_at))
      .filter((year) => year !== null);

    return [...new Set(years)].sort((a, b) => b - a);
  }, [allDeceasedRecords]);

  // Memoized Status Count Calculation - UPDATED LOGIC
  const statusCounts = useMemo(() => {
    const counts = {
      received: 0,
      underCare: 0,
      ready: 0,
      completed: 0,
      other: 0,
      total: allDeceasedRecords.length,
    };

    allDeceasedRecords.forEach((record) => {
      const status = (record.status || '').toLowerCase();

      if (status.includes('received') || status.includes('new')) {
        counts.received++;
      } else if (
        status.includes('undercare') ||
        status.includes('pending') ||
        status.includes('inprogress')
      ) {
        counts.underCare++;
      } else if (status.includes('ready') || status.includes('awaitingcollection')) {
        counts.ready++;
      } else if (
        status.includes('completed') ||
        status.includes('released') ||
        status.includes('discharged')
      ) {
        counts.completed++;
      } else {
        counts.other++;
      }
    });

    return counts;
  }, [allDeceasedRecords]);

  // Fetch data function
  const fetchDeceased = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/restpoint/deceased-all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const records = result.data;

      if (Array.isArray(records)) {
        const normalizedRecords = records
          .map((record) => ({
            ...record,
            current_status: record.status,
            // Ensure boolean fields are properly handled
            has_kin: Boolean(record.has_kin),
            has_autopsy: Boolean(record.has_autopsy),
            // Ensure deceased_id is available for navigation
            deceased_id: record.deceased_id || record.id,
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setAllDeceasedRecords(normalizedRecords);
        setFilteredDeceasedRecords(normalizedRecords);
      } else {
        setError(result.message || 'No deceased records found or unexpected response format.');
        setAllDeceasedRecords([]);
        setFilteredDeceasedRecords([]);
      }

      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching deceased records:', err);
      setError(
        'Failed to load deceased records. Please ensure the backend is running and accessible at  IP  168.122.8.0  mumos  home servers ',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeceased();
  }, []);

  // Generate Report Function with date range options
  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const queryParams = new URLSearchParams();

      // Add period parameter
      queryParams.append('period', reportPeriod);

      // Add date range based on selection
      if (reportPeriod === 'custom') {
        if (customStartDate) queryParams.append('startDate', customStartDate);
        if (customEndDate) queryParams.append('endDate', customEndDate);
      } else {
        const dateRange = getDateRange(reportPeriod);
        if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
        if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
      }

      // Add current filters
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }

      if (autopsyFilter !== 'all') {
        queryParams.append('hasAutopsy', autopsyFilter === 'performed' ? '1' : '0');
      }

      if (yearFilter !== 'all' && yearFilter.length === 4) {
        queryParams.append('year', yearFilter);
      }

      const url = `${API_BASE_URL}/api/v1/restpoint/deceased/export-excel?${queryParams.toString()}`;

      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `deceased_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Filtering Logic
  useEffect(() => {
    let currentFiltered = allDeceasedRecords;

    // 1. Search Term Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (record) =>
          (record.full_name && record.full_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (record.admission_number &&
            record.admission_number.toLowerCase().includes(lowerCaseSearchTerm)),
      );
    }

    // 2. Autopsy Filter
    if (autopsyFilter === 'performed') {
      currentFiltered = currentFiltered.filter((record) => record.has_autopsy === true);
    } else if (autopsyFilter === 'notPerformed') {
      currentFiltered = currentFiltered.filter((record) => record.has_autopsy === false);
    }

    // 3. Year Filter
    if (yearFilter !== 'all' && yearFilter.length === 4 && /^\d+$/.test(yearFilter)) {
      currentFiltered = currentFiltered.filter((record) => {
        const recordYear = extractYear(record.created_at);
        return recordYear === yearFilter;
      });
    }

    // 4. Status Filter
    if (statusFilter !== 'all') {
      currentFiltered = currentFiltered.filter((record) => {
        const status = (record.status || '').toLowerCase();

        switch (statusFilter) {
          case 'received':
            return status.includes('received') || status.includes('new');
          case 'underCare':
            return (
              status.includes('undercare') ||
              status.includes('pending') ||
              status.includes('inprogress')
            );
          case 'ready':
            return status.includes('ready') || status.includes('awaitingcollection');
          case 'completed':
            return (
              status.includes('completed') ||
              status.includes('released') ||
              status.includes('discharged')
            );
          default:
            return true;
        }
      });
    }

    setFilteredDeceasedRecords(currentFiltered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, autopsyFilter, yearFilter, statusFilter, allDeceasedRecords]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredDeceasedRecords.length / itemsPerPage);
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentRecords = filteredDeceasedRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = Number(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleNewRegistrationClick = () => {
    navigate('/register-deceased');
  };

  // FIXED: Use deceased_id for navigation instead of id
  const handleViewDetailsClick = (record) => {
    // Use deceased_id if available, otherwise fall back to id
    const deceasedId = record.deceased_id || record.id;
    navigate(`/deceased-details/${deceasedId}`);
  };

  // Custom year input handler
  const handleYearChange = (value) => {
    if (value === 'all' || (value.length <= 4 && /^\d*$/.test(value))) {
      setYearFilter(value);
    }
  };

  // Status filter handler
  const handleStatusFilter = (statusType) => {
    if (statusFilter === statusType) {
      setStatusFilter('all'); // Toggle off if already active
    } else {
      setStatusFilter(statusType); // Set to new status filter
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setAutopsyFilter('all');
    setYearFilter('all');
    setStatusFilter('all');
  };

  // Toggle filter visibility on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <PaginationButton key={i} active={currentPage === i} onClick={() => handlePageChange(i)}>
            {i}
          </PaginationButton>,
        );
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          buttons.push(
            <PaginationButton
              key={i}
              active={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationButton>,
          );
        }
        buttons.push(
          <span key="ellipsis1" style={{ padding: '0.4rem' }}>
            ...
          </span>,
        );
        buttons.push(
          <PaginationButton
            key={totalPages}
            active={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationButton>,
        );
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        buttons.push(
          <PaginationButton key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
            1
          </PaginationButton>,
        );
        buttons.push(
          <span key="ellipsis2" style={{ padding: '0.4rem' }}>
            ...
          </span>,
        );
        for (let i = totalPages - 3; i <= totalPages; i++) {
          buttons.push(
            <PaginationButton
              key={i}
              active={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationButton>,
          );
        }
      } else {
        // In the middle
        buttons.push(
          <PaginationButton key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
            1
          </PaginationButton>,
        );
        buttons.push(
          <span key="ellipsis3" style={{ padding: '0.4rem' }}>
            ...
          </span>,
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          buttons.push(
            <PaginationButton
              key={i}
              active={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationButton>,
          );
        }
        buttons.push(
          <span key="ellipsis4" style={{ padding: '0.4rem' }}>
            ...
          </span>,
        );
        buttons.push(
          <PaginationButton
            key={totalPages}
            active={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationButton>,
        );
      }
    }

    return buttons;
  };

  // Render mobile card view
  const renderMobileCard = (record) => (
    <MobileCard key={record.id}>
      <MobileCardHeader>
        <MobileCardTitle>{record.full_name || 'Unknown'}</MobileCardTitle>
        <StatusPill status={record.status}>{record.status || 'Unknown'}</StatusPill>
      </MobileCardHeader>

      <MobileCardDetails>
        <MobileDetailRow>
          <span className="label">Admission No:</span>
          <span className="value">{record.admission_number || 'N/A'}</span>
        </MobileDetailRow>

        <MobileDetailRow>
          <span className="label">Date of Death:</span>
          <span className="value">
            {record.date_of_death ? new Date(record.date_of_death).toLocaleDateString() : 'N/A'}
          </span>
        </MobileDetailRow>

        <MobileDetailRow>
          <span className="label">Created:</span>
          <span className="value">
            {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}
          </span>
        </MobileDetailRow>
      </MobileCardDetails>

      <MobileStatusRow>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Next of Kin:</span>
          <StatusIcon type="kin" status={record.has_kin ? 'success' : 'danger'}>
            {record.has_kin ? <CheckCircle size={16} /> : <XCircle size={16} />}
          </StatusIcon>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Autopsy:</span>
          <StatusIcon type="autopsy" status={record.has_autopsy ? 'success' : 'danger'}>
            {record.has_autopsy ? <CheckCircle size={16} /> : <XCircle size={16} />}
          </StatusIcon>
        </div>
      </MobileStatusRow>

      {/* FIXED: Use deceased_id for navigation */}
      <ViewDetailsButton onClick={() => handleViewDetailsClick(record)}>
        <Eye size={16} />
        View Details
      </ViewDetailsButton>
    </MobileCard>
  );

  // Render desktop table row
  const renderTableRow = (record) => (
    <tr key={record.id}>
      <td data-label="Full Name">{record.full_name || 'Unknown'}</td>
      <td data-label="Admission No">{record.admission_number || 'N/A'}</td>
      <td data-label="Date of Death">
        {record.date_of_death ? new Date(record.date_of_death).toLocaleDateString() : 'N/A'}
      </td>
      <td data-label="Created">
        {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}
      </td>
      <td data-label="Status" className="text-center">
        <StatusPill status={record.status}>{record.status || 'Unknown'}</StatusPill>
      </td>
      <td data-label="Next of Kin" className="text-center">
        <StatusIcon type="kin" status={record.has_kin ? 'success' : 'danger'}>
          {record.has_kin ? <CheckCircle size={18} /> : <XCircle size={18} />}
        </StatusIcon>
      </td>
      <td data-label="Autopsy" className="text-center">
        <StatusIcon type="autopsy" status={record.has_autopsy ? 'success' : 'danger'}>
          {record.has_autopsy ? <CheckCircle size={18} /> : <XCircle size={18} />}
        </StatusIcon>
      </td>
      <td data-label="Actions" className="text-center">
        {/* FIXED: Use deceased_id for navigation */}
        <ViewDetailsButton onClick={() => handleViewDetailsClick(record)}>
          <Eye size={16} />
          View Details
        </ViewDetailsButton>
      </td>
    </tr>
  );

  // Report Modal Component
  const ReportModal = () => (
    <ModalOverlay onClick={() => setShowReportModal(false)}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <FileText size={24} />
          Export to Exel Sheets
        </ModalHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <FilterLabel>Report Period:</FilterLabel>
            <FilterSelect
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="lastQuarter">Last Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Date Range</option>
            </FilterSelect>
          </div>

          {reportPeriod === 'custom' && (
            <div
              style={{ display: 'flex', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' }}
            >
              <div style={{ flex: 1 }}>
                <FilterLabel>Start Date:</FilterLabel>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{ ...InputStyle, width: '100%', marginTop: '0.5rem' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <FilterLabel>End Date:</FilterLabel>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{ ...InputStyle, width: '100%', marginTop: '0.5rem' }}
                />
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: Colors.lightGray,
              borderRadius: '0.4rem',
            }}
          >
            <strong>Current filters included in report:</strong>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              {statusFilter !== 'all' && <div>Status: {statusFilter}</div>}
              {autopsyFilter !== 'all' && <div>Autopsy: {autopsyFilter}</div>}
              {yearFilter !== 'all' && <div>Year: {yearFilter}</div>}
              {searchTerm && <div>Search: "{searchTerm}"</div>}
            </div>
          </div>
        </div>

        <ModalButtons>
          <PrimaryButton
            onClick={() => setShowReportModal(false)}
            style={{ backgroundColor: Colors.mediumGray, color: Colors.darkGray }}
          >
            Cancel
          </PrimaryButton>
          <ReportButton onClick={generateReport} disabled={generatingReport}>
            {generatingReport ? <AnimatedLoader2 size={18} /> : <FileText size={18} />}
            Export - Exel
          </ReportButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );

  return (
    <AppContainer>
      <ContentWrapper>
        <HeaderSection>
          <Title>
            <Users size={28} />
            All Deceased Records
          </Title>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <PrimaryButton refresh onClick={fetchDeceased} disabled={loading}>
              {loading ? <AnimatedLoader2 size={18} /> : <RefreshCw size={18} />}
              Refresh
            </PrimaryButton>

            <ReportButton
              onClick={() => setShowReportModal(true)}
              disabled={loading || filteredDeceasedRecords.length === 0}
            >
              <FileText size={18} />
              Export - Exel
            </ReportButton>

            <PrimaryButton primary onClick={handleNewRegistrationClick}>
              <PlusCircle size={18} />
              Add New
            </PrimaryButton>
          </div>
        </HeaderSection>

        {/* Status Summary */}

        {/* Pagination - MOVED TO TOP */}
        {!loading && !error && filteredDeceasedRecords.length > 0 && (
          <Paginator>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: Colors.darkGray }}>
                Page {currentPage} of {totalPages} • Showing {indexOfFirstRecord + 1}-
                {Math.min(indexOfLastRecord, filteredDeceasedRecords.length)} of{' '}
                {filteredDeceasedRecords.length} records
              </span>
              <ItemsPerPageSelect value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </ItemsPerPageSelect>
            </div>

            <PaginationControls>
              <PaginationButton onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                First
              </PaginationButton>
              <PaginationButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
              </PaginationButton>

              {generatePaginationButtons()}

              <PaginationButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} />
              </PaginationButton>
              <PaginationButton
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </PaginationButton>
            </PaginationControls>
          </Paginator>
        )}

        {/* Mobile Filter Toggle */}
        <MobileFilterToggle onClick={toggleFilters}>
          <span>Filters</span>
          <Filter size={18} />
        </MobileFilterToggle>

        {/* Filters */}
        <FilterContainer showFilters={showFilters}>
          <FilterGroup>
            <FilterLabel>
              <Search size={16} />
              Search:
            </FilterLabel>
            <SearchInput>
              <Search size={16} />
              <input
                type="text"
                placeholder="Name or Admission No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInput>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              <Microscope size={16} />
              Autopsy:
            </FilterLabel>
            <FilterSelect value={autopsyFilter} onChange={(e) => setAutopsyFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="performed">Performed</option>
              <option value="notPerformed">Not Performed</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              <Calendar size={16} />
              Year:
            </FilterLabel>
            <YearFilterInput>
              <div className="year-select-container">
                <input
                  type="text"
                  placeholder="YYYY"
                  value={yearFilter === 'all' ? '' : yearFilter}
                  onChange={(e) => handleYearChange(e.target.value)}
                  maxLength={4}
                />
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                  <option value="all">All Years</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </YearFilterInput>
          </FilterGroup>

          <FilterGroup>
            <PrimaryButton
              onClick={clearAllFilters}
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
            >
              Clear Filters
            </PrimaryButton>
          </FilterGroup>
        </FilterContainer>

        {/* Results Count */}
        {!loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: Colors.darkGray }}>
              Showing {filteredDeceasedRecords.length} of {allDeceasedRecords.length} records
            </span>
            {filteredDeceasedRecords.length === 0 && allDeceasedRecords.length > 0 && (
              <WarningMessage>
                <AlertTriangle size={18} />
                No records match your current filters
              </WarningMessage>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <CenteredContainer>
            <AnimatedLoader2 size={40} color={Colors.accentBlue} />
            <div>Loading deceased records...</div>
          </CenteredContainer>
        )}

        {/* Error State */}
        {error && !loading && (
          <CenteredContainer>
            <AlertTriangle size={40} color={Colors.dangerRed} />
            <div>{error}</div>
            <PrimaryButton onClick={fetchDeceased}>
              <RefreshCw size={18} />
              Try Again
            </PrimaryButton>
          </CenteredContainer>
        )}

        {/* Success State */}
        {!loading && !error && (
          <>
            {/* Desktop Table View */}
            {!isMobile && filteredDeceasedRecords.length > 0 && (
              <StyledCard>
                <TableContainer>
                  <StyledTable>
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Admission No</th>
                        <th>Date of Death</th>
                        <th>Created</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Next of Kin</th>
                        <th className="text-center">Autopsy</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>{currentRecords.map(renderTableRow)}</tbody>
                  </StyledTable>
                </TableContainer>
              </StyledCard>
            )}

            {/* Mobile Card View */}
            {isMobile && filteredDeceasedRecords.length > 0 && (
              <div>{currentRecords.map(renderMobileCard)}</div>
            )}

            {/* No Results */}
            {!loading && filteredDeceasedRecords.length === 0 && allDeceasedRecords.length > 0 && (
              <CenteredContainer>
                <ClipboardList size={40} color={Colors.mediumGray} />
                <div>No records found matching your filters</div>
                <PrimaryButton onClick={clearAllFilters}>Clear Filters</PrimaryButton>
              </CenteredContainer>
            )}

            {/* Empty State */}
            {!loading && allDeceasedRecords.length === 0 && (
              <CenteredContainer>
                <Users size={40} color={Colors.mediumGray} />
                <div>No deceased records found</div>
                <PrimaryButton primary onClick={handleNewRegistrationClick}>
                  <PlusCircle size={18} />
                  Add First Record
                </PrimaryButton>
              </CenteredContainer>
            )}
          </>
        )}

        {/* Report Modal */}
        {showReportModal && <ReportModal />}
      </ContentWrapper>
    </AppContainer>
  );
};

export default AllDeceasedPage;
