import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Clock, Calendar, AlertTriangle, TrendingUp, TrendingDown, Hourglass, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Colors = {
  background: '#F0F4F8',
  cardBg: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  borderColor: '#E5E7EB',
  shadow: '0 2px 8px rgba(0,0,0,0.1)',
  
  accentBlue: '#2563EB',
  successGreen: '#059669',
  warningYellow: '#D97706',
  dangerRed: '#EF4444',
};

const ProgressContainer = styled.div`
  background-color: ${Colors.cardBg};
  padding: 0.8rem;
  box-shadow: ${Colors.shadow};
  border: 1px solid ${Colors.borderColor};
  color: ${Colors.textPrimary};
  font-family: 'Inter', sans-serif;
 
  width:  100%;
`;

const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${Colors.borderColor};
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  background-color: ${props => props.bgColor};
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ProgressTitle = styled.h3`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${Colors.textPrimary};
  font-weight: 700;
`;

const ProgressBarWrapper = styled.div`
  background-color: ${Colors.borderColor};
  height: 8px;
  margin: 1rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background: ${props => {
    if (props.percentage > 90) return Colors.dangerRed;
    if (props.percentage > 50) return Colors.warningYellow;
    return Colors.accentBlue;
  }};
  transition: width 0.5s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: ${Colors.textSecondary};
  margin-top: 0.5rem;
  font-weight: 500;

  span strong {
    color: ${Colors.textPrimary};
    font-weight: 700;
  }
`;

const DispatchInfo = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${Colors.borderColor};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${Colors.textPrimary};
  font-weight: 600;

  &.overdue {
    color: ${Colors.dangerRed};
  }
`;

const AdditionalInfo = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${Colors.borderColor};
  font-size: 0.8rem;
  color: ${Colors.textSecondary};
  
  div {
    margin-bottom: 0.25rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: ${Colors.textPrimary};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: ${Colors.textSecondary};
  font-weight: 500;
  
  svg {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: ${Colors.dangerRed};
  font-weight: 500;
  text-align: center;
`;

const MortuaryProgress = ({ apiBaseUrl = 'http://localhost:5000/api/v1/restpoint' }) => {
  const { id: deceasedId } = useParams();
  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeceasedData = async () => {
    if (!deceasedId) {
      setError('No deceased ID provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${apiBaseUrl}/deceased-id?id=${deceasedId}`);
      
      if (response.data && response.data.data) {
        setDeceasedData(response.data.data);
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError(err.response?.data?.message || "Failed to load mortuary data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeceasedData();
  }, [deceasedId]);

  const getDaysInMortuary = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <ProgressContainer>
        <LoadingContainer>
          <Loader2 size={20} />
          Loading mortuary data...
        </LoadingContainer>
      </ProgressContainer>
    );
  }

  if (error) {
    return (
      <ProgressContainer>
        <ErrorContainer>
          <AlertTriangle size={20} style={{ marginRight: '0.5rem' }} />
          {error}
        </ErrorContainer>
      </ProgressContainer>
    );
  }

  if (!deceasedData) {
    return (
      <ProgressContainer>
        <ErrorContainer>
          No data found for this deceased record
        </ErrorContainer>
      </ProgressContainer>
    );
  }

  // Extract data from API response
  const daysInMortuary = deceasedData.financial_details?.days_spent || 
                        getDaysInMortuary(deceasedData.date_admitted);
  const dispatchDate = deceasedData.dispatch_date;
  const status = deceasedData.status || 'Active';
  const maxDays = 30;
  const isOverdue = daysInMortuary > maxDays;
  const percentage = Math.min(100, (daysInMortuary / maxDays) * 100);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = () => {
    if (isOverdue) return Colors.dangerRed;
    if (status === 'Dispatched' || deceasedData.dispatch_date) return Colors.successGreen;
    if (status === 'Pending') return Colors.warningYellow;
    return Colors.successGreen;
  };

  const getStatusText = () => {
    if (isOverdue) return 'Overdue';
    if (status === 'Dispatched') return 'Dispatched';
    if (deceasedData.dispatch_date) return 'Scheduled';
    return 'Active';
  };

  return (
    <ProgressContainer>
      <BadgesContainer>
        <Badge bgColor={Colors.accentBlue}>
          <Clock size={14} /> Days: {daysInMortuary}
        </Badge>
        <Badge bgColor={getStatusBadgeColor()}>
          {isOverdue ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
          Status: {getStatusText()}
        </Badge>
        {dispatchDate && (
          <Badge bgColor={Colors.accentBlue}>
            <Calendar size={14} /> Dispatch Set
          </Badge>
        )}
        {deceasedData.financial_details?.balance > 0 && (
          <Badge bgColor={Colors.warningYellow}>
            <AlertTriangle size={14} /> Payment Due
          </Badge>
        )}
      </BadgesContainer>

      <ProgressHeader>
        <ProgressTitle><Hourglass size={18} /> Mortuary Stay Progress</ProgressTitle>
        <div style={{ fontSize: '0.8rem', color: Colors.textSecondary }}>
          ID: {deceasedData.deceased_id}
        </div>
      </ProgressHeader>

      <div>
        <ProgressBarWrapper>
          <ProgressFill percentage={percentage} />
        </ProgressBarWrapper>
        <ProgressStats>
          <span>Admission: {formatDate(deceasedData.date_admitted)}</span>
          <span>
            Day <strong>{daysInMortuary}</strong> of {maxDays}
          </span>
          <span>Max Stay: {maxDays} days</span>
        </ProgressStats>
      </div>
      
      {dispatchDate && (
        <DispatchInfo className={isOverdue ? 'overdue' : ''}>
          {isOverdue ? <AlertTriangle size={16} /> : <Calendar size={16} />}
          <span>
            {isOverdue ? 'Overdue dispatch date: ' : 'Scheduled dispatch date: '}
            <strong>{formatDate(dispatchDate)}</strong>
          </span>
        </DispatchInfo>
      )}

      {isOverdue && !dispatchDate && (
        <DispatchInfo className="overdue">
          <AlertTriangle size={16} />
          <span>
            <strong>Attention needed:</strong> Exceeded maximum stay duration
          </span>
        </DispatchInfo>
      )}

      <AdditionalInfo>
        <div><strong>Admission No:</strong> {deceasedData.admission_number || 'N/A'}</div>
        <div><strong>Location:</strong> {deceasedData.location || 'N/A'}</div>
        {deceasedData.financial_details && (
          <div><strong>Balance:</strong> KSh {deceasedData.financial_details.balance?.toLocaleString() || '0'}</div>
        )}
      </AdditionalInfo>
    </ProgressContainer>
  );
};

export default MortuaryProgress;