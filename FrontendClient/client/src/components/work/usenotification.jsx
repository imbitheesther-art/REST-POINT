import React from 'react';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NotificationItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 300px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success': return '#00B894';
      case 'error': return '#E74C3C';
      case 'warning': return '#F39C12';
      case 'info': return '#3498DB';
      default: return '#3498DB';
    }
  }};
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-out;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  color: ${props => {
    switch (props.type) {
      case 'success': return '#00B894';
      case 'error': return '#E74C3C';
      case 'warning': return '#F39C12';
      case 'info': return '#3498DB';
      default: return '#3498DB';
    }
  }};
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2C3E50;
`;

const Message = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #5D6D7E;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #95A5A6;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #7F8C8D;
    background: #ECF0F1;
  }
`;

const useNotification = () => {
  const [notifications, setNotifications] = React.useState([]);

  const showNotification = (type, title, message, duration = 5000) => {
    const id = Date.now().toString();
    const notification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isExiting: true } : notif
    ));
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 300);
  };

  const NotificationComponent = () => (
    <NotificationContainer>
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          type={notification.type}
          isExiting={notification.isExiting}
        >
          <IconWrapper type={notification.type}>
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <XCircle size={20} />}
            {notification.type === 'warning' && <AlertTriangle size={20} />}
            {notification.type === 'info' && <Info size={20} />}
          </IconWrapper>
          
          <Content>
            <Title>{notification.title}</Title>
            <Message>{notification.message}</Message>
          </Content>
          
          <CloseButton onClick={() => removeNotification(notification.id)}>
            <X size={16} />
          </CloseButton>
        </NotificationItem>
      ))}
    </NotificationContainer>
  );

  return {
    showNotification,
    removeNotification,
    NotificationComponent
  };
};

export default useNotification;