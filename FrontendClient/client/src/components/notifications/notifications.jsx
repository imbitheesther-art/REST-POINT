import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  Badge, 
  Button, 
  Container, 
  Row, 
  Col, 
  Alert, 
  Modal, 
  Spinner,
  Card,
  Dropdown,
  Form,
  InputGroup,
  ListGroup,
  ProgressBar,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faUser,
  faBell,
  faBellSlash,
  faEnvelopeOpen,
  faEnvelope,
  faInfoCircle,
  faVolumeUp,
  faCircle,
  faTimes,
  faCheckDouble,
  faCheck,
  faEllipsisV,
  faFilter,
  faEye,
  faEyeSlash,
  faSortAmountDown,
  faSortAmountUp,
  faSearch,
  faArchive,
  faClock,
  faCalendarAlt,
  faExternalLinkAlt,
  faReply,
  faForward,
  faStar,
  faStar as faStarRegular,
  faPaperPlane,
  faCog,
  faUserCircle,
  faChevronRight,
  faChevronLeft,
  faSync,
  faExpandAlt,
  faCompressAlt,
  faDownload,
  faPrint,
  faShareAlt,
  faBookmark,
  faBookmark as faBookmarkRegular,
  faMoon,
  faSun,
  faLanguage,
  faPalette,
  faVolumeMute,
  faVolumeHigh,
  faMobileAlt,
  faDesktop,
  faChevronDown,
  faChevronUp,
  faDotCircle,
  faCheckCircle,
  faCommentDots,
  faMessage,
  faThLarge,
  faThList,
  faEllipsisH
} from "@fortawesome/free-solid-svg-icons";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import io from "socket.io-client";

// WhatsApp-inspired Color Palette
const COLORS = {
  primary: {
    light: "#0084ff",
    main: "#007bff",
    dark: "#0066cc",
    whatsapp: "#25d366",
    incoming: "#ffffff",
    outgoing: "#dcf8c6",
    tick: "#34b7f1"
  },
  accent: {
    light: "#06b6d4",
    main: "#0891b2",
    dark: "#0e7490",
  },
  gray: {
    50: "#f0f2f5",
    100: "#e9edef",
    150: "#dfe5e7",
    200: "#d1d7db",
    300: "#b0b7bd",
    400: "#88929c",
    500: "#667781",
    600: "#3b4a54",
    700: "#2a3942",
    800: "#1f2c33",
    900: "#111b21",
    950: "#0b141a"
  }
};

// WhatsApp message types
const NOTIFICATION_TYPES = {
  new_body: {
    name: "New",
    icon: faUser,
    incomingColor: "#ffffff",
    outgoingColor: "#d1f7c4",
    tickColor: COLORS.primary.tick,
    emoji: "📥"
  },
  movement: {
    name: "Move",
    icon: faBell,
    incomingColor: "#ffffff",
    outgoingColor: "#fff2cc",
    tickColor: COLORS.primary.tick,
    emoji: "🚚"
  },
  emergency: {
    name: "Alert",
    icon: faTimes,
    incomingColor: "#ffffff",
    outgoingColor: "#ffd6d6",
    tickColor: COLORS.primary.tick,
    emoji: "🚨"
  },
  reminder: {
    name: "Remind",
    icon: faBell,
    incomingColor: "#ffffff",
    outgoingColor: "#ffe6cc",
    tickColor: COLORS.primary.tick,
    emoji: "⏰"
  },
  system: {
    name: "System",
    icon: faCog,
    incomingColor: "#ffffff",
    outgoingColor: "#d6eaff",
    tickColor: COLORS.primary.tick,
    emoji: "⚙️"
  },
  default: {
    name: "Notify",
    icon: faBell,
    incomingColor: "#ffffff",
    outgoingColor: "#e6e6e6",
    tickColor: COLORS.primary.tick,
    emoji: "📨"
  }
};

const API_BASE_URL = "http://localhost:5000/api/v1/restpoint";
const SOCKET_URL = "http://localhost:5000";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [starredNotifications, setStarredNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [forceSound, setForceSound] = useState(false);
  const [viewedMessages, setViewedMessages] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [gridView, setGridView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const audioRef = useRef(null);
  const socketRef = useRef(null);
  const notificationSoundRef = useRef(null);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setGridView(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load notification sound
  useEffect(() => {
    notificationSoundRef.current = new Audio('/notification-sound.mp3');
    notificationSoundRef.current.load();
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback((type = "default") => {
    if (!soundEnabled && !forceSound) return;
    
    try {
      if (notificationSoundRef.current && notificationSoundRef.current.readyState >= 2) {
        notificationSoundRef.current.currentTime = 0;
        notificationSoundRef.current.play().catch(e => {
          playFallbackSound(type);
        });
      } else {
        playFallbackSound(type);
      }
    } catch (error) {
      playFallbackSound(type);
    }
  }, [soundEnabled, forceSound]);

  const playFallbackSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.15;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.error("Fallback sound failed:", error);
    }
  };

  // Filter and sort notifications
  useEffect(() => {
    let filtered = [...notifications];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.message?.toLowerCase().includes(query) ||
        n.deceased_id?.toLowerCase().includes(query) ||
        n.type?.toLowerCase().includes(query)
      );
    }
    
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(n => selectedTypes.includes(n.type));
    }
    
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.is_read);
    } else if (filter === 'starred') {
      filtered = filtered.filter(n => starredNotifications.includes(n.id));
    }
    
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredNotifications(filtered);
    setUnreadCount(notifications.filter(n => !n.is_read).length);
  }, [notifications, filter, sortOrder, searchQuery, selectedTypes, starredNotifications]);

  // Mark message as viewed
  const markMessageAsViewed = (notificationId) => {
    setViewedMessages(prev => ({
      ...prev,
      [notificationId]: {
        viewed: true,
        viewedAt: new Date().toISOString()
      }
    }));
  };

  // WhatsApp-style ticks component with blue ticks
  const MessageTicks = ({ notificationId, isRead }) => {
    const isViewed = viewedMessages[notificationId]?.viewed;
    
    return (
      <div className="message-ticks" style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        marginLeft: '4px'
      }}>
        {isRead ? (
          <span style={{ position: 'relative', width: '16px', height: '12px' }}>
            <FontAwesomeIcon 
              icon={faCheck} 
              style={{ 
                fontSize: '10px',
                color: isViewed ? COLORS.primary.tick : COLORS.gray[500],
                position: 'absolute',
                left: '0',
                top: '0'
              }} 
            />
            <FontAwesomeIcon 
              icon={faCheck} 
              style={{ 
                fontSize: '10px',
                color: isViewed ? COLORS.primary.tick : COLORS.gray[500],
                position: 'absolute',
                left: '4px',
                top: '0'
              }} 
            />
          </span>
        ) : (
          <FontAwesomeIcon 
            icon={faCheck} 
            style={{ 
              fontSize: '12px',
              color: COLORS.gray[500]
            }} 
          />
        )}
      </div>
    );
  };

  // Socket.IO setup
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      setError("");
    });

    socketRef.current.on('new_notification', (newNotification) => {
      if (newNotification?.message) {
        const notificationWithType = {
          ...newNotification,
          type: newNotification.type || 'default',
          is_read: 0,
          created_at: new Date().toISOString(),
          id: `socket_${Date.now()}`
        };

        setNotifications(prev => [notificationWithType, ...prev]);
        
        playNotificationSound(newNotification.type);
        
        if (Notification.permission === "granted") {
          new Notification("New Notification", {
            body: newNotification.message,
            icon: "/notification-icon.png",
            silent: false
          });
        }
      }
    });

    socketRef.current.on('connect_error', () => {
      setSocketConnected(false);
    });

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [playNotificationSound]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notifications`);
      
      if (response.data?.data) {
        const validNotifications = response.data.data
          .filter(n => n?.id && n?.message)
          .map(n => ({
            ...n,
            type: n.type || 'default',
            timestamp: new Date(n.created_at).getTime()
          }));
        
        setNotifications(validNotifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Toggle star
  const toggleStar = (id) => {
    if (starredNotifications.includes(id)) {
      setStarredNotifications(prev => prev.filter(starId => starId !== id));
    } else {
      setStarredNotifications(prev => [...prev, id]);
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    if (readOnlyMode) return;
    
    const result = await Swal.fire({
      title: "Delete?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: COLORS.gray[500],
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: 'rounded-lg'
      }
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingIds(prev => [...prev, id]);
      await axios.delete(`${API_BASE_URL}/notifications/${id}`);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      Swal.fire({
        title: "Deleted!",
        text: "Notification deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-lg'
        }
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete.",
        icon: "error",
        customClass: {
          popup: 'rounded-lg'
        }
      });
    } finally {
      setDeletingIds(prev => prev.filter(deletingId => deletingId !== id));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (readOnlyMode) return;
    
    try {
      await axios.put(`${API_BASE_URL}/notifications/mark-all-read`);
      const updatedNotifications = notifications.map(n => ({ ...n, is_read: 1 }));
      setNotifications(updatedNotifications);
      
      const viewed = {};
      updatedNotifications.forEach(n => {
        viewed[n.id] = { viewed: true, viewedAt: new Date().toISOString() };
      });
      setViewedMessages(viewed);
      
      Swal.fire({
        title: "Done!",
        text: "All marked as read.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-lg'
        }
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to mark as read.",
        icon: "error",
        customClass: {
          popup: 'rounded-lg'
        }
      });
    }
  };

  // Mark as read
  const markAsRead = async (id) => {
    if (readOnlyMode) return;
    
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/mark-read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      
      markMessageAsViewed(id);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Toggle notification type filter
  const toggleTypeFilter = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(prev => prev.filter(t => t !== type));
    } else {
      setSelectedTypes(prev => [...prev, type]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilter('all');
    setSelectedTypes([]);
    setSearchQuery("");
  };

  // WhatsApp-style alternating message bubbles
  const WhatsAppMessageBubble = ({ notification, index }) => {
    const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.default;
    const isUnread = !notification.is_read;
    const isDeleting = deletingIds.includes(notification.id);
    const isStarred = starredNotifications.includes(notification.id);
    
    // Alternate between incoming (white) and outgoing (colored) messages
    const isOutgoing = index % 2 === 0; // Even indexes are outgoing
    const bubbleStyle = isOutgoing ? {
      background: darkMode ? '#005c4b' : typeConfig.outgoingColor,
      alignSelf: 'flex-end',
      borderTopRightRadius: '4px',
      borderTopLeftRadius: '14px',
      borderBottomRightRadius: '14px',
      borderBottomLeftRadius: '14px',
      marginLeft: 'auto',
      maxWidth: isMobile ? '85%' : '70%'
    } : {
      background: darkMode ? '#1f2c33' : typeConfig.incomingColor,
      alignSelf: 'flex-start',
      borderTopRightRadius: '14px',
      borderTopLeftRadius: '4px',
      borderBottomRightRadius: '14px',
      borderBottomLeftRadius: '14px',
      marginRight: 'auto',
      maxWidth: isMobile ? '85%' : '70%'
    };

    const textColor = darkMode ? (isOutgoing ? '#e7ffdb' : '#e9edef') : (isOutgoing ? '#111b21' : '#111b21');
    const timeColor = darkMode ? (isOutgoing ? '#a3b4b9' : '#8696a0') : (isOutgoing ? '#667781' : '#667781');

    return (          
      <div 
        className="whatsapp-message-bubble"
        onClick={() => {
          setSelectedNotification(notification);
          setShowDetailModal(true);
          if (isUnread && !readOnlyMode) {
            markAsRead(notification.id);
          }
        }}
        style={{
          ...bubbleStyle,
          padding: '8px 12px',
          marginBottom: '8px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          minWidth: '120px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)';
        }}
      >
        {/* Message header */}
        <div className="d-flex justify-content-between align-items-start mb-1">
          <div className="d-flex align-items-center gap-2">
            <span 
              style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                color: isOutgoing ? (darkMode ? '#53bdeb' : COLORS.primary.main) : (darkMode ? COLORS.gray[300] : typeConfig.tickColor),
                background: isOutgoing ? (darkMode ? 'rgba(83, 189, 235, 0.1)' : 'rgba(0, 123, 255, 0.1)') : 'transparent',
                padding: '1px 6px',
                borderRadius: '8px'
              }}
            >
              {typeConfig.name}
            </span>
            
            {isStarred && (
              <FontAwesomeIcon 
                icon={faStar} 
                style={{ 
                  color: isOutgoing ? (darkMode ? '#ffd700' : '#d97706') : (darkMode ? '#ffd700' : '#d97706'),
                  fontSize: '0.7rem'
                }}
              />
            )}
          </div>
          
          {/* Action menu */}
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="link" 
              className="p-0"
              style={{
                color: timeColor,
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FontAwesomeIcon icon={faEllipsisV} size="xs" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="rounded-lg">
              <Dropdown.Item onClick={(e) => {
                e.stopPropagation();
                toggleStar(notification.id);
              }}>
                <FontAwesomeIcon icon={isStarred ? faStarRegular : faStar} className="me-2" />
                {isStarred ? "Unstar" : "Star"}
              </Dropdown.Item>
              {!readOnlyMode && (
                <>
                  {isUnread && (
                    <Dropdown.Item onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}>
                      <FontAwesomeIcon icon={faCheckDouble} className="me-2" />
                      Mark as read
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="text-danger"
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                    Delete
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Message content */}
        <p 
          style={{
            color: textColor,
            lineHeight: '1.4',
            fontSize: '0.9rem',
            marginBottom: '4px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {notification.message}
        </p>

        {/* Message footer */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            {notification.deceased_id && (
              <div 
                style={{
                  fontSize: '0.7rem',
                  color: timeColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <FontAwesomeIcon icon={faUser} size="2xs" />
                <span>{notification.deceased_id}</span>
              </div>
            )}
          </div>
          
          <div className="d-flex align-items-center gap-1">
            <span 
              style={{
                fontSize: '0.65rem',
                color: timeColor
              }}
            >
              {formatTime(notification.created_at)}
            </span>
            <MessageTicks 
              notificationId={notification.id} 
              isRead={notification.is_read} 
            />
            {isUnread && (
              <div 
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isOutgoing ? (darkMode ? '#53bdeb' : COLORS.primary.main) : (darkMode ? COLORS.primary.whatsapp : COLORS.primary.whatsapp),
                  marginLeft: '2px'
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Stats card
  const StatsCard = ({ title, value, icon, color }) => (
    <div 
      className="stats-card"
      style={{
        background: darkMode 
          ? '#1f2c33' 
          : 'white',
        border: darkMode ? '1px solid #2a3942' : `1px solid ${COLORS.gray[200]}`,
        borderRadius: '10px',
        padding: '10px',
        height: '100%'
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div 
            style={{
              fontSize: '0.75rem',
              fontWeight: '500',
              color: darkMode ? COLORS.gray[400] : COLORS.gray[500],
              marginBottom: '2px'
            }}
          >
            {title}
          </div>
          <div 
            style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: darkMode ? 'white' : COLORS.gray[900]
            }}
          >
            {value}
          </div>
        </div>
        <div 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}
        >
          <FontAwesomeIcon icon={icon} size="sm" />
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="notifications-container"
      style={{
        background: darkMode 
          ? COLORS.gray[950]
          : COLORS.gray[50],
        minHeight: '100vh',
        transition: 'background 0.3s ease'
      }}
    >
      {/* WhatsApp-style Header */}
      <div 
        style={{
          background: darkMode 
            ? '#1f2c33' 
            : '#008069',
          padding: isMobile ? '12px 0' : '16px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div 
                style={{
                  width: isMobile ? '36px' : '42px',
                  height: isMobile ? '36px' : '42px',
                  borderRadius: '50%',
                  background: darkMode ? '#005c4b' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: darkMode ? 'white' : '#008069',
                  marginRight: '12px',
                  flexShrink: 0
                }}
              >
                <FontAwesomeIcon icon={faBell} />
              </div>
              <div>
                <h1 
                  style={{
                    fontWeight: '600',
                    color: 'white',
                    fontSize: isMobile ? '1.1rem' : '1.3rem',
                    margin: 0,
                    lineHeight: 1
                  }}
                >
                  Notifications
                </h1>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '2px'
                  }}
                >
                  <span 
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {socketConnected ? '🟢 Online' : '⚫ Offline'}
                  </span>
                  <span 
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {notifications.length} messages
                  </span>
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              {/* Search Bar - Moved to between title and icons */}
              {!isMobile && (
                <div style={{ width: '200px', marginRight: '12px' }}>
                  <InputGroup className="rounded-pill" size="sm">
                    <InputGroup.Text 
                      className="border-0 bg-white"
                      style={{
                        borderRight: '1px solid #e9edef'
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={faSearch} 
                        style={{ color: COLORS.gray[500] }}
                      />
                    </InputGroup.Text>
                    <Form.Control
                      ref={notificationSoundRef}
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0"
                      style={{
                        fontSize: '0.85rem'
                      }}
                    />
                  </InputGroup>
                </div>
              )}
              
              <Button
                variant="light"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-circle"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <FontAwesomeIcon icon={soundEnabled ? faBell : faBellSlash} />
              </Button>
              
              <Button
                variant="light"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-circle"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              </Button>
              
              <Button
                variant="light"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-circle"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <FontAwesomeIcon icon={faFilter} />
              </Button>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          {isMobile && (
            <div className="mt-2">
              <InputGroup className="rounded-pill">
                <InputGroup.Text 
                  className="border-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                >
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  ref={notificationSoundRef}
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                />
              </InputGroup>
            </div>
          )}
        </Container>
      </div>

      {/* Main Content */}
      <Container className={isMobile ? "py-2" : "py-3"}>
        {/* Stats Cards */}
        <Row className={isMobile ? "g-2 mb-2" : "g-3 mb-3"}>
          <Col xs={6} sm={3}>
            <StatsCard
              title="Total"
              value={notifications.length}
              icon={faBell}
              color={COLORS.primary.main}
            />
          </Col>
          <Col xs={6} sm={3}>
            <StatsCard
              title="Unread"
              value={unreadCount}
              icon={faEnvelope}
              color="#d97706"
            />
          </Col>
          <Col xs={6} sm={3}>
            <StatsCard
              title="Starred"
              value={starredNotifications.length}
              icon={faStar}
              color="#ec4899"
            />
          </Col>
          <Col xs={6} sm={3}>
            <StatsCard
              title="Today"
              value={notifications.filter(n => {
                const date = new Date(n.created_at);
                const today = new Date();
                return date.toDateString() === today.toDateString();
              }).length}
              icon={faCalendarAlt}
              color="#10b981"
            />
          </Col>
        </Row>

        {/* Filter Controls */}
        {(showFilters || isMobile) && (
          <div 
            className="mb-3"
            style={{
              background: darkMode 
                ? '#1f2c33' 
                : 'white',
              border: darkMode ? '1px solid #2a3942' : `1px solid ${COLORS.gray[200]}`,
              borderRadius: '12px',
              padding: '12px'
            }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <div className="d-flex flex-wrap gap-1">
                {['all', 'unread', 'read', 'starred'].map((filterType) => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? "primary" : (darkMode ? "dark" : "light")}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                    className="rounded-pill px-3"
                    style={{
                      fontWeight: '500',
                      fontSize: '0.8rem',
                      border: 'none',
                      padding: '4px 12px',
                      background: filter === filterType ? COLORS.primary.main : (darkMode ? '#2a3942' : COLORS.gray[100]),
                      color: filter === filterType ? 'white' : (darkMode ? COLORS.gray[300] : COLORS.gray[700])
                    }}
                  >
                    {filterType === 'all' ? 'All' : 
                     filterType === 'unread' ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` :
                     filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </Button>
                ))}
                
                <Dropdown>
                  <Dropdown.Toggle 
                    variant={selectedTypes.length > 0 ? "primary" : (darkMode ? "dark" : "light")}
                    size="sm"
                    className="rounded-pill px-3 d-flex align-items-center gap-1"
                    style={{
                      fontWeight: '500',
                      fontSize: '0.8rem',
                      border: 'none',
                      padding: '4px 12px',
                      background: selectedTypes.length > 0 ? COLORS.primary.main : (darkMode ? '#2a3942' : COLORS.gray[100]),
                      color: selectedTypes.length > 0 ? 'white' : (darkMode ? COLORS.gray[300] : COLORS.gray[700])
                    }}
                  >
                    <FontAwesomeIcon icon={faFilter} size="xs" />
                    {selectedTypes.length > 0 ? `${selectedTypes.length}` : 'Types'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu 
                    className="rounded-lg"
                    style={{
                      background: darkMode ? '#1f2c33' : 'white',
                      border: darkMode ? '1px solid #2a3942' : `1px solid ${COLORS.gray[200]}`,
                      padding: '8px'
                    }}
                  >
                    {Object.keys(NOTIFICATION_TYPES).map((type) => (
                      <Dropdown.Item 
                        key={type}
                        onClick={() => toggleTypeFilter(type)}
                        className="d-flex align-items-center gap-2 rounded"
                        style={{
                          background: selectedTypes.includes(type) 
                            ? (darkMode ? '#2a3942' : COLORS.gray[100])
                            : 'transparent',
                          color: darkMode ? COLORS.gray[300] : COLORS.gray[700],
                          padding: '6px 12px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '20px',
                            height: '20px',
                            background: NOTIFICATION_TYPES[type].outgoingColor,
                            color: COLORS.gray[700],
                            fontSize: '0.7rem'
                          }}
                        >
                          {NOTIFICATION_TYPES[type].emoji}
                        </div>
                        {NOTIFICATION_TYPES[type].name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              
              <div className="d-flex gap-2 align-items-center">
                <Button
                  variant={darkMode ? "dark" : "light"}
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="rounded-circle"
                  style={{
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    background: darkMode ? '#2a3942' : COLORS.gray[100],
                    color: darkMode ? COLORS.gray[300] : COLORS.gray[700],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FontAwesomeIcon 
                    icon={sortOrder === 'desc' ? faSortAmountDown : faSortAmountUp} 
                    size="sm"
                  />
                </Button>
                
                {!readOnlyMode && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="rounded-pill px-3"
                    style={{
                      fontWeight: '500',
                      fontSize: '0.8rem',
                      background: COLORS.primary.main,
                      border: 'none',
                      padding: '4px 12px'
                    }}
                  >
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
            
            {(searchQuery || selectedTypes.length > 0 || filter !== 'all') && (
              <div className="d-flex justify-content-between align-items-center mt-2">
                <span 
                  style={{
                    fontSize: '0.8rem',
                    color: darkMode ? COLORS.gray[400] : COLORS.gray[500]
                  }}
                >
                  {filteredNotifications.length} of {notifications.length} notifications
                </span>
                <Button
                  variant="link"
                  onClick={clearFilters}
                  size="sm"
                  style={{
                    fontSize: '0.8rem',
                    color: COLORS.primary.main,
                    textDecoration: 'none'
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Area - WhatsApp Chat Style */}
        <div>
          {loading ? (
            <div className="text-center py-5">
              <div className="position-relative d-inline-block">
                <Spinner 
                  animation="border" 
                  variant="primary"
                  style={{ 
                    width: '2.5rem', 
                    height: '2.5rem',
                    borderWidth: '2px'
                  }}
                />
                <FontAwesomeIcon 
                  icon={faBell} 
                  className="position-absolute top-50 start-50 translate-middle"
                  style={{ 
                    color: COLORS.primary.main, 
                    fontSize: '0.9rem' 
                  }}
                />
              </div>
              <p 
                className="mt-3 mb-0"
                style={{ 
                  color: darkMode ? COLORS.gray[300] : COLORS.gray[600],
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}
              >
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div 
              className="whatsapp-chat-container"
              style={{ 
                maxHeight: isMobile ? 'calc(100vh - 280px)' : '65vh', 
                overflowY: 'auto',
                padding: '0 8px'
              }}
            >
              {filteredNotifications.map((notification, index) => (
                <div 
                  key={notification.id}
                  className="message-wrapper"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '2px'
                  }}
                >
                  {/* Optional: Add date separator for new days */}
                  {index > 0 && new Date(filteredNotifications[index-1].created_at).toDateString() !== new Date(notification.created_at).toDateString() && (
                    <div 
                      className="date-separator text-center my-2"
                      style={{
                        fontSize: '0.75rem',
                        color: darkMode ? COLORS.gray[400] : COLORS.gray[500],
                        padding: '4px 12px',
                        background: darkMode ? '#1f2c33' : COLORS.gray[100],
                        borderRadius: '12px',
                        margin: '8px auto',
                        width: 'fit-content'
                      }}
                    >
                      {new Date(notification.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  
                  <WhatsAppMessageBubble 
                    notification={notification}
                    index={index}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-4"
              style={{
                background: darkMode 
                  ? '#1f2c33' 
                  : 'white',
                borderRadius: '12px',
                border: darkMode ? '1px solid #2a3942' : `1px solid ${COLORS.gray[200]}`,
                padding: '40px 20px'
              }}
            >
              <div 
                className="empty-state-icon mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: darkMode 
                    ? '#2a3942' 
                    : COLORS.gray[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontSize: '1.5rem'
                }}
              >
                {searchQuery || selectedTypes.length > 0 ? '🔍' : '💬'}
              </div>
              <h6 
                style={{ 
                  color: darkMode ? COLORS.gray[300] : COLORS.gray[700],
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}
              >
                {searchQuery ? 'No messages found' : 'No notifications yet'}
              </h6>
              <p 
                className="text-muted mb-3"
                style={{ 
                  fontSize: '0.85rem',
                  maxWidth: '300px', 
                  margin: '0 auto'
                }}
              >
                {searchQuery 
                  ? `No notifications matching "${searchQuery}"`
                  : 'When you get notifications, they will appear here.'}
              </p>
              {(searchQuery || selectedTypes.length > 0) && (
                <Button
                  variant="primary"
                  onClick={clearFilters}
                  className="rounded-pill px-3"
                  size="sm"
                  style={{
                    background: COLORS.primary.main,
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '0.85rem'
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* Mobile Floating Action Button */}
      {isMobile && !readOnlyMode && unreadCount > 0 && (
        <div 
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 1000
          }}
        >
          <Button
            variant="primary"
            onClick={markAllAsRead}
            className="rounded-circle shadow-lg"
            style={{
              width: '48px',
              height: '48px',
              background: COLORS.primary.main,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
          </Button>
        </div>
      )}

      {/* WhatsApp-style Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size={isMobile ? "sm" : "md"}
        centered
        className="border-0"
        contentClassName="rounded-lg"
        style={{
          background: 'transparent'
        }}
      >
        {selectedNotification && (
          <div 
            className="modal-content"
            style={{
              background: darkMode 
                ? '#1f2c33'
                : 'white',
              border: darkMode ? '1px solid #2a3942' : `1px solid ${COLORS.gray[200]}`,
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <Modal.Header className="border-0 p-4" style={{ background: darkMode ? '#2a3942' : COLORS.gray[50] }}>
              <div className="d-flex align-items-center w-100">
                <div 
                  className="me-3"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: darkMode ? '#005c4b' : COLORS.gray[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: darkMode ? 'white' : COLORS.gray[700],
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}
                >
                  {NOTIFICATION_TYPES[selectedNotification.type]?.emoji}
                </div>
                <div className="flex-grow-1">
                  <Modal.Title 
                    className="mb-1"
                    style={{
                      color: darkMode ? 'white' : COLORS.gray[900],
                      fontWeight: '600',
                      fontSize: '1.1rem'
                    }}
                  >
                    {NOTIFICATION_TYPES[selectedNotification.type]?.name}
                  </Modal.Title>
                  <div 
                    style={{
                      fontSize: '0.85rem',
                      color: darkMode ? COLORS.gray[400] : COLORS.gray[500]
                    }}
                  >
                    {formatTime(selectedNotification.created_at)}
                    {selectedNotification.deceased_id && ` • ID: ${selectedNotification.deceased_id}`}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <MessageTicks 
                    notificationId={selectedNotification.id} 
                    isRead={selectedNotification.is_read} 
                  />
                  <Button 
                    variant="close" 
                    onClick={() => setShowDetailModal(false)}
                    style={{
                      color: darkMode ? COLORS.gray[400] : COLORS.gray[500]
                    }}
                  />
                </div>
              </div>
            </Modal.Header>
            
            <Modal.Body className="p-4 pt-0">
              <div 
                className="message-content p-3 rounded-lg mb-4 mt-3"
                style={{
                  background: darkMode 
                    ? '#2a3942'
                    : COLORS.gray[100],
                  border: darkMode 
                    ? '1px solid #374151'
                    : `1px solid ${COLORS.gray[200]}`
                }}
              >
                <p 
                  className="mb-0"
                  style={{
                    color: darkMode ? COLORS.gray[200] : COLORS.gray[800],
                    lineHeight: '1.6',
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {selectedNotification.message}
                </p>
              </div>
            </Modal.Body>
            
            <Modal.Footer className="border-0 p-4 pt-0">
              <div className="d-flex justify-content-between w-100">
                <div className="d-flex gap-2">
                  <Button
                    variant={darkMode ? "dark" : "light"}
                    onClick={() => toggleStar(selectedNotification.id)}
                    className="rounded-pill px-3 d-flex align-items-center gap-2"
                    size="sm"
                    style={{
                      background: darkMode ? '#2a3942' : COLORS.gray[100],
                      border: 'none',
                      color: darkMode ? COLORS.gray[300] : COLORS.gray[700]
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={starredNotifications.includes(selectedNotification.id) ? faStar : faStarRegular} 
                      size="sm"
                    />
                    {starredNotifications.includes(selectedNotification.id) ? "Unstar" : "Star"}
                  </Button>
                </div>
                
                <div className="d-flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailModal(false)}
                    className="rounded-pill px-3"
                    size="sm"
                    style={{
                      background: darkMode ? '#2a3942' : COLORS.gray[100],
                      border: 'none',
                      color: darkMode ? COLORS.gray[300] : COLORS.gray[700]
                    }}
                  >
                    Close
                  </Button>
                  {!selectedNotification.is_read && !readOnlyMode && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        markAsRead(selectedNotification.id);
                        setShowDetailModal(false);
                      }}
                      className="rounded-pill px-3"
                      size="sm"
                      style={{
                        background: COLORS.primary.main,
                        border: 'none'
                      }}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            </Modal.Footer>
          </div>
        )}
      </Modal>

      {/* Audio element */}
      <audio 
        ref={audioRef}
        src="/notification-sound.mp3" 
        preload="auto"
      />

      {/* Global Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .whatsapp-message-bubble {
          animation: slideIn 0.2s ease-out;
        }
        
        @keyframes tickAnimation {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .message-ticks svg {
          animation: tickAnimation 0.2s ease-out;
        }
        
        /* WhatsApp-style scrollbar */
        .whatsapp-chat-container::-webkit-scrollbar {
          width: 4px;
        }
        
        .whatsapp-chat-container::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2c33' : COLORS.gray[50]};
          border-radius: 2px;
        }
        
        .whatsapp-chat-container::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#2a3942' : COLORS.gray[300]};
          border-radius: 2px;
        }
        
        .whatsapp-chat-container::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#374151' : COLORS.gray[400]};
        }
        
        .modal-backdrop {
          backdrop-filter: blur(4px);
          background-color: rgba(0, 0, 0, 0.3);
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        
        /* WhatsApp typing indicator effect */
        @keyframes typing {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .typing-indicator span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${COLORS.gray[500]};
          animation: typing 1.5s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) { animation-delay: 0s; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export default Notifications;