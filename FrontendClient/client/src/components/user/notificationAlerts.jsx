import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { AlertTriangle, Loader2, Bell } from 'lucide-react';

// --- Styled / Utility ---
const Colors = {
  background: '#F0F4F8',
  cardBg: '#FFFFFF',
  cardShadow: '0 8px 30px rgba(0,0,0,0.06)',
  borderColor: '#E2E8F0',
  primary: '#4F46E5',
  success: '#10B981',
  textDark: '#1F2937',
  textMuted: '#6B7280',
};

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideInUp = keyframes`from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

const Wrapper = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family: 'Inter', sans-serif;
  background-color: ${Colors.background};
  border-radius: 1rem;
`;

const NotificationCard = styled.div`
  background-color: ${Colors.cardBg};
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: ${Colors.cardShadow};
  border: 1px solid ${Colors.borderColor};
  animation: ${fadeIn} 0.5s ease-out;
  color: ${Colors.textDark};
`;

const CardHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${Colors.primary};
`;

const NotificationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NotificationItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background-color: #F8F9FB;
  border-radius: 0.75rem;
  border: 1px solid ${Colors.borderColor};
  font-weight: 500;
  color: ${Colors.textDark};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  animation: ${slideInUp} 0.5s ease-out forwards;
  animation-delay: ${({ index }) => index * 0.1}s;
`;

const NotificationMessage = styled.span`
  flex-grow: 1;
`;

const NotificationPrice = styled.span`
  font-weight: 700;
  color: ${Colors.success};
  font-size: 1.1rem;
  white-space: nowrap;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 150px;
  text-align: center;
  color: ${Colors.textMuted};
`;

const LoaderIcon = styled(Loader2)`
  animation: ${spin} 1.5s linear infinite;
  color: ${Colors.primary};
`;

const StyledAlertIcon = styled(AlertTriangle)`
  color: #EF4444;
`;

// --- Helper function to format currency ---
const formatKsh = (amount) => `Ksh ${Number(amount).toLocaleString()}`;

// --- Main Component ---
const NotificationAlerts = () => {
  const { id } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('No deceased ID provided.');
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/deceased/notifications?id=${id}`);
        if (!response.ok) throw new Error('Failed to fetch notifications.');
        const data = await response.json();
        setNotifications(data.notifications || []);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error fetching notifications:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [id]);

  return (
    <Wrapper>
      <NotificationCard>
        <CardHeader>
          <Bell size={24} />
          Notifications
        </CardHeader>
        {isLoading ? (
          <StatusContainer>
            <LoaderIcon size={36} />
            <span>Loading notifications...</span>
          </StatusContainer>
        ) : error ? (
          <StatusContainer>
            <StyledAlertIcon size={36} />
            <span>{error}</span>
          </StatusContainer>
        ) : notifications.length === 0 ? (
          <StatusContainer>
            <span role="img" aria-label="bell">🔔</span>
            <p>No new notifications at this time.</p>
          </StatusContainer>
        ) : (
          <NotificationList>
            {notifications.map((note, index) => (
              <NotificationItem key={index} index={index}>
                <NotificationMessage>
                  {typeof note === 'string' ? note : note.message || JSON.stringify(note)}
                </NotificationMessage>
                {typeof note === 'object' && note.price && (
                  <NotificationPrice>{formatKsh(note.price)}</NotificationPrice>
                )}
              </NotificationItem>
            ))}
          </NotificationList>
        )}
      </NotificationCard>
    </Wrapper>
  );
};

export default NotificationAlerts;
