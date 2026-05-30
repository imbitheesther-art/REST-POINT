import React, { useEffect, useState, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import styled, { keyframes, css } from 'styled-components';

// --- Configuration ---
// Define color themes for different alert types
const ALERT_THEMES = {
  critical: {
    color: '#D32F2F', // Red
    background: '#FFEBEE', // Very light Red
    border: '#C62828', // Darker Red
    shadow: 'rgba(211, 47, 47, 0.7)', // Red shadow for pulse
    icon: '🚨',
    title: 'CRITICAL',
    priority: 1,
  },
  warning: {
    color: '#FFA000', // Amber/Orange
    background: '#FFF8E1', // Very light Yellow
    border: '#FF8F00', // Darker Orange
    shadow: 'rgba(255, 160, 0, 0.7)', // Orange shadow
    icon: '⚠️',
    title: 'WARNING',
    priority: 2,
  },
  info: {
    color: '#388E3C', // Green
    background: '#E8F5E9', // Very light Green
    border: '#2E7D32', // Darker Green
    shadow: 'rgba(56, 142, 60, 0.7)', // Green shadow
    icon: '✅',
    title: 'INFO',
    priority: 3,
  },
};

// --- Animations ---
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const pulse = (shadowColor) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${shadowColor};
  }
  70% {
    box-shadow: 0 0 0 10px ${shadowColor}00; /* Fade out */
  }
  100% {
    box-shadow: 0 0 0 0 ${shadowColor}00;
  }
`;

// --- Styled components ---

const GlobalAlertContainer = styled.div`
  position: fixed;
  top: 0px;
  right: 50px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  /* Add some default animation to the entire container for when it appears */
  transition: transform 0.3s ease-in-out;
`;

const AlertsStack = styled.div`
  max-height: 80vh; 
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse; 
  gap: 10px;
  padding: 0px;
  margin-top: 15px; /* Space between the minimized button and the stack */

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const AlertWrapper = styled.div`
  min-width: 300px;
  max-width: 450px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease-in-out;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  ${({ $alertType }) => {
    const theme = ALERT_THEMES[$alertType] || ALERT_THEMES.warning;
    return css`
      border-left: 5px solid ${theme.border};
      animation: ${slideInRight} 0.5s ease-out;
      /* Only pulse for critical/urgent alerts */
      ${$alertType === 'critical' && css`
          animation: ${slideInRight} 0.5s ease-out, ${pulse(theme.shadow)} 2.5s infinite;
      `}
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      background-color: ${theme.background};
    `;
  }}

  &.fade-out {
    animation: ${slideOutRight} 0.3s ease-in forwards;
  }
`;

const AlertContent = styled.div`
  padding: 0.8rem 1.2rem;
  position: relative;
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem;
`;

const AlertTitle = styled.h5`
  margin: 0;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $alertType }) => (ALERT_THEMES[$alertType] || ALERT_THEMES.warning).border};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: ${({ $alertType }) => (ALERT_THEMES[$alertType] || ALERT_THEMES.warning).color};
  transition: color 0.2s;

  &:hover {
    color: ${({ $alertType }) => (ALERT_THEMES[$alertType] || ALERT_THEMES.warning).border};
  }
`;

const AlertMessage = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
  color: ${({ $alertType }) => (ALERT_THEMES[$alertType] || ALERT_THEMES.warning).border};
`;

const AlertTime = styled.div`
  font-size: 0.7rem;
  margin-top: 0.5rem;
  text-align: right;
  color: ${({ $alertType }) => (ALERT_THEMES[$alertType] || ALERT_THEMES.warning).color};
`;

const ConsolidatedAlert = styled(AlertWrapper)`
    padding: 0.8rem 1.2rem;
    cursor: pointer;
    background-color: #fce4ec !important; /* Lighter Pink */
    border-color: #e91e63 !important; /* Pink/Red for a distinct callout */
    box-shadow: 0 4px 15px rgba(233, 30, 99, 0.5);

    h5 {
        color: #e91e63 !important;
        font-size: 1.2rem;
        font-weight: 900;
    }
    p {
        color: #e91e63 !important;
    }
`;

const MinimizedButton = styled.button`
  background-color: #1e88e5; /* Blue for the toggler */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  margin-top: 5px; 
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    background-color: #1565c0; 
    transform: translateY(-2px);
  }
`;

const AlertBadge = styled.span`
  margin-left: 8px;
  background-color: #e53935; /* Red for high visibility */
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.8rem;
  font-weight: bold;
  animation: ${pulse('rgba(229, 57, 53, 0.7)')} 2s infinite;
`;

const TestBeepButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #90a4ae; 
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  z-index: 10000;

  &:hover {
    background-color: #607d8b;
  }
`;

// --- Main component ---
export default function ActiveMonitoringAlert() {
  const [alerts, setAlerts] = useState([]);
  // Start minimized if there are more than 3 pending alerts on mount
  const [isMinimized, setIsMinimized] = useState(alerts.length > 3);
  const audioContextRef = useRef(null);
  
  const MINIMIZE_THRESHOLD = 5;

  // Find the highest priority alert for the consolidation message
  const highestPriorityAlert = useMemo(() => {
    if (alerts.length === 0) return null;
    return alerts.reduce((highest, current) => {
        const highestPriority = ALERT_THEMES[highest.type]?.priority || Infinity;
        const currentPriority = ALERT_THEMES[current.type]?.priority || Infinity;
        return currentPriority < highestPriority ? current : highest;
    }, alerts[0]);
  }, [alerts]);



   const handleTestBeep = () => {
    const audioContext = getAudioContext();
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        playBeepSound();
      });
    } else {
      playBeepSound();
    }
  };
  
  // New combined function to test alert when none exist
  const handleEmptyStateTest = () => {
      handleTestBeep();
      setAlerts([{ 
          id: Date.now(), 
          message: 'Test Critical Alert (Simulated)', 
          timestamp: new Date().toLocaleTimeString(), 
          type: 'critical' 
      }]);
  }

  // Audio Context and Sound logic (unchanged from the last version, but included for completeness)
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const playBeepSound = () => {
    try {
      const audioContext = getAudioContext();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      // ... (rest of sound logic)
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 750;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.warn('⚠️ Web Audio API failed, trying fallback audio', error);
      const audio = new Audio('/audio/short_beep.mp3'); 
      audio.play().catch(() => {
        console.error('❌ Could not play beep sound fallback');
      });
    }
  };

  // Socket.IO connection and listeners
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const addAlert = (alertData, defaultType = 'warning') => {
      const type = alertData.type || defaultType;
      const newAlert = {
        id: Date.now() + Math.random(),
        message: alertData.message || alertData.alert || 'Monitoring alert triggered',
        timestamp: new Date().toLocaleTimeString(),
        type: type,
        isDismissing: false,
        ...alertData,
      };

      setAlerts(prev => {
        const newAlerts = [newAlert, ...prev];
        // Auto-minimize if we cross the threshold (only on new alerts)
        if (newAlerts.length > MINIMIZE_THRESHOLD && !isMinimized) {
            setIsMinimized(true);
        }
        return newAlerts;
      });
      playBeepSound();

      // IMPORTANT: If a CRITICAL alert comes in, un-minimize the container
      if (type === 'critical' && isMinimized) {
          setIsMinimized(false);
      }

      // Auto-remove alert after 10 seconds
      setTimeout(() => {
        setAlerts(prev => prev.map(a => a.id === newAlert.id ? { ...a, isDismissing: true } : a));
        setTimeout(() => {
            setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
        }, 300); 
      }, 10000);
    };

    socket.on('critical_alert', (alertData) => addAlert(alertData, 'critical'));
    socket.on('active_monitoring_alert', (alertData) => addAlert(alertData, 'warning'));
    socket.on('monitoring_alert', (alertData) => addAlert(alertData, 'info'));

    return () => {
      socket.disconnect();
    };
  }, [isMinimized]);

  const removeAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isDismissing: true } : a));
    setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 300);
  };

  const removeAllAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isDismissing: true })));
    setTimeout(() => {
        setAlerts([]);
        setIsMinimized(false); // Reset minimize state after clearing
    }, 300);
  }

  const toggleMinimize = () => {
      setIsMinimized(prev => !prev);
  }

  const getAlertTitleAndIcon = (type) => {
      const theme = ALERT_THEMES[type] || ALERT_THEMES.warning;
      return {
          title: theme.title,
          icon: theme.icon,
      };
  }

  if (alerts.length === 0)


  return (
    <>
      <GlobalAlertContainer>
        <MinimizedButton onClick={toggleMinimize} aria-label={isMinimized ? "Show Alerts" : "Minimize Alerts"}>
          {isMinimized ? (
            <>
              AMA
              <AlertBadge>{alerts.length}</AlertBadge>
            </>
          ) : (
            <>
              Minimize
              <AlertBadge>{alerts.length}</AlertBadge>
            </>
          )}
        </MinimizedButton>

        {/* Display the consolidated/stack of alerts */}
        {!isMinimized && (
          <AlertsStack>
            {/* 1. If there are too many alerts, show a consolidated message 
                2. On click of consolidated alert, clear all
            */}
            {alerts.length > MINIMIZE_THRESHOLD && highestPriorityAlert && (
                <ConsolidatedAlert 
                    role="status" 
                    aria-live="polite" 
                    onClick={removeAllAlerts}
                >
                    <AlertHeader>
                        <h5>⚠️ ACTIVE MONITORING ALERT!</h5>
                        <CloseButton onClick={(e) => { e.stopPropagation(); removeAllAlerts(); }}>
                            CLEAR ALL
                        </CloseButton>
                    </AlertHeader>
                    <AlertMessage>
                        **{alerts.length}** pending issues. Highest priority: **{highestPriorityAlert.message}** ({highestPriorityAlert.type.toUpperCase()}). Click to dismiss all.
                    </AlertMessage>
                </ConsolidatedAlert>
            )}

            {/* Display individual alerts, limiting the number shown */}
            {alerts.slice(0, MINIMIZE_THRESHOLD).map((alert) => {
              const { title, icon } = getAlertTitleAndIcon(alert.type);
              return (
                <AlertWrapper 
                  key={alert.id} 
                  $alertType={alert.type} 
                  role="alert" 
                  aria-live="assertive" 
                  aria-atomic="true"
                  className={alert.isDismissing ? 'fade-out' : ''}
                >
                  <AlertContent>
                    <AlertHeader>
                      <AlertTitle $alertType={alert.type}>
                        <span role="img" aria-label={title}>
                          {icon}
                        </span>{' '}
                        {title}
                      </AlertTitle>
                      <CloseButton onClick={() => removeAlert(alert.id)} aria-label="Close alert" $alertType={alert.type}>
                        ×
                      </CloseButton>
                    </AlertHeader>
                    <AlertMessage $alertType={alert.type}>{alert.message}</AlertMessage>
                    <AlertTime $alertType={alert.type}>{alert.timestamp}</AlertTime>
                  </AlertContent>
                </AlertWrapper>
              );
            })}
          </AlertsStack>
        )}
      </GlobalAlertContainer>

  
    </>
  );
}