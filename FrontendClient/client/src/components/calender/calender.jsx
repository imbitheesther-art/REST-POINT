import React, { useState, useEffect, useRef } from 'react'; 
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Button, Form, Spinner, Badge, InputGroup, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { format, addHours, isPast, isToday, isTomorrow, isAfter, parseISO, isValid, parse } from 'date-fns';
import Swal from 'sweetalert2';
import styled from 'styled-components';

// Import icons
import { 
  Calendar, Clock, Plus, Edit, Trash2, 
  Search, CheckCheck, AlertCircle, Bell,
  ChevronRight, User, Briefcase, Users,
  Truck, Cross, Heart, MessageCircle,
  Phone, Zap, Filter, X, ChevronLeft,
  ChevronDown, CalendarDays
} from 'lucide-react';

// Professional color scheme
const Colors = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  text: '#1E293B',
  textLight: '#64748B',
  
  // Enhanced category colors with better contrast
  categories: {
    MORTUARY: '#6366F1', // Indigo
    OFFICE: '#0EA5E9', // Sky blue
    MEETING: '#8B5CF6', // Violet
    CEMETERY: '#10B981', // Emerald
    TRANSPORT: '#F59E0B', // Amber
    PERSONAL: '#EC4899', // Pink
    TRAINING: '#14B8A6', // Teal
    MEDICAL: '#F97316', // Orange
    FAMILY: '#A855F7', // Purple
    URGENT: '#EF4444', // Red
    OTHER: '#6B7280' // Gray
  }
};

// Main container
const CalendarWrapper = styled.div`
  background: ${Colors.background};
  min-height: 100vh;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

// Responsive layout
const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Main calendar area
const CalendarArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// Sidebar for upcoming events
const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

// Mobile upcoming events button
const MobileUpcomingButton = styled(Button)`
  display: none;
  width: 100%;
  margin-bottom: 1rem;
  
  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
`;

// Header
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${Colors.cardBg};
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    color: ${Colors.text};
    letter-spacing: -0.025em;
  }
  
  .badge {
    background: ${Colors.primaryLight}20;
    color: ${Colors.primary};
    border: none;
    font-weight: 500;
    padding: 0.375rem 0.75rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const PrimaryButton = styled(Button)`
  background: ${Colors.primary};
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${Colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  background: ${Colors.cardBg};
  border: 1px solid ${Colors.border};
  color: ${Colors.text};
  border-radius: 8px;
  padding: 0.625rem 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${Colors.background};
    border-color: ${Colors.primary};
  }
`;

// Search bar
const SearchContainer = styled.div`
  background: ${Colors.cardBg};
  border: 1px solid ${Colors.border};
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 0.95rem;
    color: ${Colors.text};
    
    &::placeholder {
      color: ${Colors.textLight};
    }
    
    &:focus {
      box-shadow: none;
    }
  }
`;

// Calendar container
const CalendarContainer = styled.div`
  background: ${Colors.cardBg};
  border: 1px solid ${Colors.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// Upcoming events card
const UpcomingCard = styled(Card)`
  border: 1px solid ${Colors.border};
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const UpcomingHeader = styled.div`
  background: ${Colors.primary};
  color: white;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    flex: 1;
  }
  
  .badge {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
  }
`;

const UpcomingList = styled.div`
  padding: 0.5rem;
  max-height: 500px;
  overflow-y: auto;
`;

const UpcomingItem = styled.div`
  padding: 0.875rem 1rem;
  border-bottom: 1px solid ${Colors.border};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${Colors.background};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const EventTime = styled.div`
  font-size: 0.8rem;
  color: ${Colors.textLight};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

// Category filter chips
const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.active ? props.color : props.color + '20'};
  color: ${props => props.active ? 'white' : props.color};
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${props => props.color}30;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.color}30;
  }
`;

// Event categories
const eventCategories = [
  { key: 'MORTUARY', label: 'Mortuary', color: Colors.categories.MORTUARY, icon: <User size={14} /> },
  { key: 'OFFICE', label: 'Office', color: Colors.categories.OFFICE, icon: <Briefcase size={14} /> },
  { key: 'MEETING', label: 'Meeting', color: Colors.categories.MEETING, icon: <Users size={14} /> },
  { key: 'CEMETERY', label: 'Cemetery', color: Colors.categories.CEMETERY, icon: <Cross size={14} /> },
  { key: 'TRANSPORT', label: 'Transport', color: Colors.categories.TRANSPORT, icon: <Truck size={14} /> },
  { key: 'PERSONAL', label: 'Personal', color: Colors.categories.PERSONAL, icon: <Heart size={14} /> },
  { key: 'TRAINING', label: 'Training', color: Colors.categories.TRAINING, icon: <MessageCircle size={14} /> },
  { key: 'MEDICAL', label: 'Medical', color: Colors.categories.MEDICAL, icon: <AlertCircle size={14} /> },
  { key: 'FAMILY', label: 'Family', color: Colors.categories.FAMILY, icon: <Phone size={14} /> },
  { key: 'URGENT', label: 'Urgent', color: Colors.categories.URGENT, icon: <Zap size={14} /> },
  { key: 'OTHER', label: 'Other', color: Colors.categories.OTHER, icon: <Calendar size={14} /> }
];

// Helper function to safely parse dates
const safeParseDate = (dateInput) => {
  if (!dateInput) return null;
  
  try {
    // If it's already a Date object
    if (dateInput instanceof Date) {
      return isValid(dateInput) ? dateInput : null;
    }
    
    // If it's a string, try to parse it
    if (typeof dateInput === 'string') {
      // Try parseISO first
      const isoDate = parseISO(dateInput);
      if (isValid(isoDate)) return isoDate;
      
      // Try parsing as regular date string
      const parsedDate = new Date(dateInput);
      return isValid(parsedDate) ? parsedDate : null;
    }
    
    // If it's a number (timestamp)
    if (typeof dateInput === 'number') {
      const date = new Date(dateInput);
      return isValid(date) ? date : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

// Get event style - FIXED VERSION
const getEventStyle = (event) => {
  const category = event.extendedProps?.category || 'OTHER';
  const categoryColor = Colors.categories[category] || Colors.categories.OTHER;
  const isCompleted = event.extendedProps?.status === 'COMPLETED';
  
  // Safely parse the end date
  const endDate = safeParseDate(event.end);
  const isPastEvent = endDate ? isPast(endDate) : false;
  
  if (isCompleted) {
    return {
      backgroundColor: Colors.success + '15',
      borderColor: Colors.success,
      textColor: Colors.success,
      categoryColor: Colors.success
    };
  }
  
  if (isPastEvent) {
    return {
      backgroundColor: Colors.secondary + '15',
      borderColor: Colors.secondary,
      textColor: Colors.secondary,
      categoryColor: Colors.secondary
    };
  }
  
  return {
    backgroundColor: categoryColor + '15',
    borderColor: categoryColor,
    textColor: categoryColor,
    categoryColor
  };
};

// Event renderer - FIXED VERSION
const renderEventContent = (eventInfo) => {
  try {
    const event = eventInfo.event;
    const isCompleted = event.extendedProps?.status === 'COMPLETED';
    const eventStyle = getEventStyle(event);
    const category = eventCategories.find(cat => cat.key === event.extendedProps?.category);
    
    // Safely parse start date
    const startDate = safeParseDate(event.start);
    const startTime = startDate ? format(startDate, 'h:mm a') : 'N/A';
    
    return (
      <div 
        className="fc-event-content"
        style={{
          background: eventStyle.backgroundColor,
          color: eventStyle.textColor,
          borderRadius: '6px',
          padding: '6px 8px',
          margin: '2px 0',
          fontSize: '0.8rem',
          lineHeight: '1.3',
          position: 'relative',
          borderLeft: `3px solid ${eventStyle.borderColor}`,
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <div style={{ 
            width: '6px',
            height: '6px',
            background: eventStyle.categoryColor,
            borderRadius: '50%'
          }} />
          <div style={{ 
            fontWeight: 500, 
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {event.title || 'Untitled Event'}
          </div>
          {isCompleted && <CheckCheck size={12} />}
        </div>
        
        <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={10} />
          <span>{startTime}</span>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering event:', error);
    return (
      <div 
        className="fc-event-content"
        style={{
          background: Colors.danger + '15',
          color: Colors.danger,
          borderRadius: '6px',
          padding: '6px 8px',
          margin: '2px 0',
          fontSize: '0.8rem',
          borderLeft: `3px solid ${Colors.danger}`
        }}
      >
        Error loading event
      </div>
    );
  }
};

// Upcoming Events Component - FIXED VERSION
const UpcomingEvents = ({ events, onEventClick, showMobile, onToggleMobile }) => {
  const upcomingEvents = events
    .map(event => {
      const startDate = safeParseDate(event.start);
      return { ...event, parsedStart: startDate };
    })
    .filter(event => event.parsedStart && isAfter(event.parsedStart, new Date()))
    .sort((a, b) => a.parsedStart - b.parsedStart)
    .slice(0, 8);

  const todayEvents = upcomingEvents.filter(event => event.parsedStart && isToday(event.parsedStart));
  const tomorrowEvents = upcomingEvents.filter(event => event.parsedStart && isTomorrow(event.parsedStart));
  const laterEvents = upcomingEvents.filter(event => 
    event.parsedStart && 
    !isToday(event.parsedStart) && 
    !isTomorrow(event.parsedStart)
  );

  const renderEventGroup = (title, eventList) => {
    if (eventList.length === 0) return null;

    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          fontSize: '0.85rem',
          fontWeight: 600,
          color: Colors.textLight,
          padding: '0.5rem 1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {title}
        </div>
        {eventList.map((event, index) => {
          const eventStyle = getEventStyle(event);
          const category = eventCategories.find(cat => cat.key === event.extendedProps?.category);
          
          return (
            <UpcomingItem key={index} onClick={() => onEventClick(event)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ 
                  width: '12px',
                  height: '12px',
                  background: eventStyle.categoryColor,
                  borderRadius: '50%',
                  marginTop: '4px'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {event.title}
                  </div>
                  <EventTime>
                    <Clock size={12} />
                    {event.parsedStart ? format(event.parsedStart, 'EEE, MMM d • h:mm a') : 'Date not available'}
                  </EventTime>
                  {category && (
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      color: category.color,
                      background: category.color + '15',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      marginTop: '0.5rem'
                    }}>
                      {category.icon}
                      {category.label}
                    </div>
                  )}
                </div>
              </div>
            </UpcomingItem>
          );
        })}
      </div>
    );
  };

  const content = (
    <UpcomingCard>
      <UpcomingHeader>
        <Bell size={20} />
        <h3>Upcoming Events</h3>
        <Badge>{upcomingEvents.length}</Badge>
      </UpcomingHeader>
      <UpcomingList>
        {renderEventGroup('Today', todayEvents)}
        {renderEventGroup('Tomorrow', tomorrowEvents)}
        {renderEventGroup('Later', laterEvents)}
        
        {upcomingEvents.length === 0 && (
          <div style={{ 
            padding: '2rem 1rem',
            textAlign: 'center',
            color: Colors.textLight
          }}>
            <Calendar size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>No upcoming events</div>
            <div style={{ fontSize: '0.9rem' }}>All caught up!</div>
          </div>
        )}
      </UpcomingList>
    </UpcomingCard>
  );

  if (showMobile) {
    return (
      <Modal show={showMobile} onHide={onToggleMobile} fullscreen="md-down" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={20} />
            Upcoming Events
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          {content.props.children}
        </Modal.Body>
      </Modal>
    );
  }

  return content;
};

// Event Modal Component - FIXED VERSION
const EventModal = ({ show, event, onClose, onEdit, onDelete }) => {
  if (!event) return null;

  const eventStyle = getEventStyle(event);
  const isCompleted = event.extendedProps?.status === 'COMPLETED';
  
  // Safely parse dates
  const startDate = safeParseDate(event.start);
  const endDate = safeParseDate(event.end);
  const isPastEvent = endDate ? isPast(endDate) : false;
  
  const category = eventCategories.find(cat => cat.key === event.extendedProps?.category);

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton style={{ borderBottom: `1px solid ${Colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
          <div style={{ 
            width: '10px',
            height: '10px',
            background: eventStyle.categoryColor,
            borderRadius: '50%',
            flexShrink: 0
          }} />
          <Modal.Title style={{ fontSize: '1.1rem', flex: 1 }}>
            {event.title}
          </Modal.Title>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isCompleted && (
              <Badge bg="success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                <CheckCheck size={12} /> Completed
              </Badge>
            )}
            {isPastEvent && !isCompleted && (
              <Badge bg="secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                Past Due
              </Badge>
            )}
          </div>
        </div>
      </Modal.Header>
      <Modal.Body style={{ padding: '1.5rem' }}>
        <Row>
          <Col md={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: Colors.textLight, marginBottom: '0.5rem' }}>
                  <Clock size={14} style={{ marginRight: '0.5rem' }} />
                  Time
                </div>
                {startDate && endDate ? (
                  <>
                    <div style={{ fontSize: '1rem', fontWeight: 500 }}>
                      {format(startDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: Colors.text }}>
                      {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.95rem', color: Colors.danger }}>
                    Date information not available
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.9rem', color: Colors.textLight, marginBottom: '0.5rem' }}>
                  <Filter size={14} style={{ marginRight: '0.5rem' }} />
                  Category & Priority
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Badge 
                    style={{ 
                      background: `${category?.color || Colors.primary}15`,
                      color: category?.color || Colors.primary,
                      border: `1px solid ${category?.color || Colors.primary}30`,
                      fontSize: '0.85rem',
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {category?.icon}
                    {event.extendedProps.category || 'Other'}
                  </Badge>
                  
                  <Badge 
                    bg={event.extendedProps.priority === 'HIGH' ? 'danger' : 
                        event.extendedProps.priority === 'MEDIUM' ? 'warning' : 'secondary'}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                  >
                    {event.extendedProps.priority || 'MEDIUM'} Priority
                  </Badge>
                </div>
              </div>

              {event.extendedProps.description && (
                <div>
                  <div style={{ fontSize: '0.9rem', color: Colors.textLight, marginBottom: '0.5rem' }}>
                    Description
                  </div>
                  <div style={{ 
                    fontSize: '0.95rem', 
                    lineHeight: '1.6',
                    padding: '1rem',
                    background: Colors.background,
                    borderRadius: '8px',
                    borderLeft: `3px solid ${eventStyle.categoryColor}`
                  }}>
                    {event.extendedProps.description}
                  </div>
                </div>
              )}
            </div>
          </Col>
          
          <Col md={4}>
            <Card style={{ border: `1px solid ${Colors.border}`, borderRadius: '8px' }}>
              <Card.Body>
                <div style={{ fontSize: '0.9rem', color: Colors.textLight, marginBottom: '1rem' }}>
                  Quick Actions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Button 
                    variant="primary"
                    onClick={onEdit}
                    style={{ 
                      background: Colors.primary,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 500
                    }}
                  >
                    <Edit size={16} />
                    Edit Event
                  </Button>
                  <Button 
                    variant="outline-danger"
                    onClick={onDelete}
                    style={{ 
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 500
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Event
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer style={{ borderTop: `1px solid ${Colors.border}` }}>
        <Button variant="outline-secondary" onClick={onClose} style={{ borderRadius: '8px' }}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Main Calendar Component
const MortuaryCalendar = () => {
  const [state, setState] = useState({
    events: [],
    selectedEvent: null,
    showModal: false,
    showDetailModal: false,
    loading: false,
    formData: {
      title: '',
      description: '',
      start: '',
      end: '',
      category: 'MORTUARY',
      priority: 'MEDIUM',
      status: 'PENDING'
    },
    editMode: false,
    searchQuery: '',
    filterCategory: 'ALL',
    showMobileUpcoming: false
  });

  const calendarRef = useRef(null);
  const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

  const fetchEvents = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      if (response.data.success) {
        // Make sure dates are properly formatted
        const events = response.data.events.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start, // Keep as string for FullCalendar
          end: event.end, // Keep as string for FullCalendar
          extendedProps: {
            description: event.description,
            category: event.category,
            priority: event.priority,
            status: event.status,
            staff: event.staff
          }
        }));
        setState(prev => ({ ...prev, events, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setState(prev => ({
        ...prev,
        events: generateMockEvents(),
        loading: false
      }));
    }
  };

  const generateMockEvents = () => {
    const events = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const start = new Date(now);
      start.setDate(start.getDate() + Math.floor(Math.random() * 30));
      start.setHours(9 + Math.floor(Math.random() * 8));
      start.setMinutes([0, 30][Math.floor(Math.random() * 2)]);
      
      const end = new Date(start);
      end.setHours(start.getHours() + Math.floor(Math.random() * 3) + 1);
      
      const category = eventCategories[Math.floor(Math.random() * eventCategories.length)];
      const isCompleted = Math.random() > 0.7;
      const isHighPriority = Math.random() > 0.8;
      
      events.push({
        id: `event-${i}`,
        title: `${category.label} Meeting`,
        start: start.toISOString(), // ISO string
        end: end.toISOString(), // ISO string
        extendedProps: {
          description: `Discuss ${category.label.toLowerCase()} matters`,
          category: category.key,
          priority: isHighPriority ? 'HIGH' : 'MEDIUM',
          status: isCompleted ? 'COMPLETED' : 'PENDING'
        }
      });
    }
    
    return events;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = (info) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        start: format(info.date, "yyyy-MM-dd'T'HH:mm"),
        end: format(addHours(info.date, 1), "yyyy-MM-dd'T'HH:mm")
      },
      showModal: true,
      editMode: false
    }));
  };

  const handleEventClick = (info) => {
    // FullCalendar passes event object with Date objects
    const eventData = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start ? info.event.start.toISOString() : null,
      end: info.event.end ? info.event.end.toISOString() : null,
      extendedProps: info.event.extendedProps || {}
    };
    
    setState(prev => ({
      ...prev,
      selectedEvent: eventData,
      showDetailModal: true
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setState(prev => ({ ...prev, loading: true }));

      if (state.editMode) {
        await axios.put(
          `${API_BASE_URL}/events/${state.selectedEvent.id}`,
          state.formData
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/events`,
          { events: [state.formData] }
        );
      }

      Swal.fire({
        icon: 'success',
        title: state.editMode ? 'Event updated' : 'Event created',
        timer: 1500,
        showConfirmButton: false,
      });

      fetchEvents();

      setState(prev => ({
        ...prev,
        showModal: false,
        loading: false,
        formData: {
          title: '',
          description: '',
          start: '',
          end: '',
          category: 'MORTUARY',
          priority: 'MEDIUM',
          status: 'PENDING'
        }
      }));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to save event',
        timer: 1500,
        showConfirmButton: false,
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await axios.delete(`${API_BASE_URL}/events/${state.selectedEvent.id}`);
      
      Swal.fire({
        icon: 'success',
        title: 'Event deleted',
        timer: 1500,
        showConfirmButton: false,
      });
      
      fetchEvents();
      
      setState(prev => ({
        ...prev,
        showDetailModal: false,
        selectedEvent: null,
        loading: false
      }));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to delete event',
        timer: 1500,
        showConfirmButton: false,
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const filteredEvents = state.events.filter(event => {
    if (state.filterCategory !== 'ALL' && event.extendedProps.category !== state.filterCategory) {
      return false;
    }
    if (state.searchQuery && !event.title.toLowerCase().includes(state.searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const upcomingEvents = state.events
    .map(event => ({
      ...event,
      parsedStart: safeParseDate(event.start)
    }))
    .filter(event => event.parsedStart && isAfter(event.parsedStart, new Date()));

  return (
    <CalendarWrapper>
      <LayoutContainer>
        <CalendarArea>
          <Header>
            <HeaderLeft>
              <CalendarDays size={28} color={Colors.primary} />
              <div>
                <h1>Calendar</h1>
                <Badge>{state.events.length} Events</Badge>
              </div>
            </HeaderLeft>
            
            <ActionButtons>
              <SecondaryButton onClick={() => setState(prev => ({ ...prev, showMobileUpcoming: true }))}>
                <Bell size={16} />
                Upcoming ({upcomingEvents.length})
              </SecondaryButton>
              <PrimaryButton onClick={() => setState(prev => ({ ...prev, showModal: true, editMode: false }))}>
                <Plus size={18} />
                New Event
              </PrimaryButton>
            </ActionButtons>
          </Header>

          <SearchContainer>
            <Search size={18} color={Colors.textLight} />
            <input
              type="text"
              placeholder="Search events by title..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </SearchContainer>

          <FilterContainer>
            <FilterChip
              color={Colors.primary}
              active={state.filterCategory === 'ALL'}
              onClick={() => setState(prev => ({ ...prev, filterCategory: 'ALL' }))}
            >
              <Calendar size={14} />
              All Events
            </FilterChip>
            
            {eventCategories.map(category => (
              <FilterChip
                key={category.key}
                color={category.color}
                active={state.filterCategory === category.key}
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  filterCategory: state.filterCategory === category.key ? 'ALL' : category.key 
                }))}
              >
                {category.icon}
                {category.label}
              </FilterChip>
            ))}
          </FilterContainer>

          <MobileUpcomingButton 
            variant="outline-primary"
            onClick={() => setState(prev => ({ ...prev, showMobileUpcoming: true }))}
          >
            <Bell size={16} />
            View Upcoming Events ({upcomingEvents.length})
            <ChevronRight size={16} />
          </MobileUpcomingButton>

          <CalendarContainer>
            {state.loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '500px'
              }}>
                <Spinner animation="border" style={{ color: Colors.primary }} />
              </div>
            ) : (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={filteredEvents}
                eventContent={renderEventContent}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                editable={true}
                selectable={true}
                weekends={true}
                height="auto"
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: 'short'
                }}
                eventDisplay="block"
                allDaySlot={false}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day'
                }}
                customButtons={{
                  prev: {
                    text: <ChevronLeft size={16} />,
                    click: () => calendarRef.current?.getApi().prev()
                  },
                  next: {
                    text: <ChevronRight size={16} />,
                    click: () => calendarRef.current?.getApi().next()
                  }
                }}
                dayMaxEvents={3}
                dayMaxEventRows={3}
                eventMaxStack={3}
                eventOrder="start,-duration,allDay,title"
              />
            )}
          </CalendarContainer>
        </CalendarArea>

        <Sidebar>
          <UpcomingEvents 
            events={state.events}
            onEventClick={(event) => {
              setState(prev => ({
                ...prev,
                selectedEvent: event,
                showDetailModal: true
              }));
            }}
            showMobile={false}
          />
        </Sidebar>
      </LayoutContainer>

      {/* Event Form Modal */}
      <Modal show={state.showModal} onHide={() => setState(prev => ({ ...prev, showModal: false }))} centered>
        <Modal.Header closeButton style={{ borderBottom: `1px solid ${Colors.border}` }}>
          <Modal.Title style={{ fontSize: '1.1rem' }}>
            {state.editMode ? 'Edit Event' : 'Create New Event'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.9rem', fontWeight: 500, color: Colors.text, marginBottom: '0.5rem' }}>
                  Event Title *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={state.formData.title}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    formData: { ...prev.formData, title: e.target.value } 
                  }))}
                  required
                  placeholder="Enter event title"
                  style={{ borderRadius: '8px', borderColor: Colors.border, padding: '0.75rem' }}
                />
              </Form.Group>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.9rem', fontWeight: 500, color: Colors.text, marginBottom: '0.5rem' }}>
                    Start Time *
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={state.formData.start}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      formData: { ...prev.formData, start: e.target.value } 
                    }))}
                    required
                    style={{ borderRadius: '8px', borderColor: Colors.border, padding: '0.75rem' }}
                  />
                </Form.Group>
                
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.9rem', fontWeight: 500, color: Colors.text, marginBottom: '0.5rem' }}>
                    End Time *
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={state.formData.end}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      formData: { ...prev.formData, end: e.target.value } 
                    }))}
                    required
                    style={{ borderRadius: '8px', borderColor: Colors.border, padding: '0.75rem' }}
                  />
                </Form.Group>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.9rem', fontWeight: 500, color: Colors.text, marginBottom: '0.5rem' }}>
                    Category
                  </Form.Label>
                  <Form.Select
                    value={state.formData.category}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      formData: { ...prev.formData, category: e.target.value } 
                    }))}
                    style={{ borderRadius: '8px', borderColor: Colors.border, padding: '0.75rem' }}
                  >
                    {eventCategories.map(category => (
                      <option key={category.key} value={category.key} style={{ color: Colors.text }}>
                        {category.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.9rem', fontWeight: 500, color: Colors.text, marginBottom: '0.5rem' }}>
                    Priority
                  </Form.Label>
                  <Form.Select
                    value={state.formData.priority}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      formData: { ...prev.formData, priority: e.target.value } 
                    }))}
                    style={{ borderRadius: '8px', borderColor: Colors.border, padding: '0.75rem' }}
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </Form.Select>
                </Form.Group>
              </div>
              
              <Form.Group>
                <Form.Label style={{ fontSize: '0.9rem', fontWeight: 500, color: Colors.text, marginBottom: '0.5rem' }}>
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={state.formData.description}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    formData: { ...prev.formData, description: e.target.value } 
                  }))}
                  placeholder="Add event details, notes, or agenda..."
                  style={{ borderRadius: '8px', borderColor: Colors.border, padding: '0.75rem', resize: 'vertical' }}
                />
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: `1px solid ${Colors.border}` }}>
            <Button 
              variant="outline-secondary" 
              onClick={() => setState(prev => ({ ...prev, showModal: false }))}
              style={{ borderRadius: '8px', padding: '0.625rem 1.5rem' }}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={state.loading}
              style={{ 
                background: Colors.primary,
                border: 'none',
                borderRadius: '8px',
                padding: '0.625rem 1.5rem',
                fontWeight: 500
              }}
            >
              {state.loading ? 'Saving...' : state.editMode ? 'Update Event' : 'Create Event'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Event Detail Modal */}
      <EventModal
        show={state.showDetailModal}
        event={state.selectedEvent}
        onClose={() => setState(prev => ({ ...prev, showDetailModal: false }))}
        onEdit={() => {
          if (state.selectedEvent) {
            setState(prev => ({
              ...prev,
              showDetailModal: false,
              showModal: true,
              editMode: true,
              formData: {
                title: state.selectedEvent.title,
                description: state.selectedEvent.extendedProps.description,
                start: format(safeParseDate(state.selectedEvent.start) || new Date(), "yyyy-MM-dd'T'HH:mm"),
                end: format(safeParseDate(state.selectedEvent.end) || new Date(), "yyyy-MM-dd'T'HH:mm"),
                category: state.selectedEvent.extendedProps.category,
                priority: state.selectedEvent.extendedProps.priority,
                status: state.selectedEvent.extendedProps.status
              }
            }));
          }
        }}
        onDelete={handleDeleteEvent}
      />

      {/* Mobile Upcoming Events Modal */}
      <UpcomingEvents 
        events={state.events}
        onEventClick={(event) => {
          setState(prev => ({
            ...prev,
            selectedEvent: event,
            showDetailModal: true,
            showMobileUpcoming: false
          }));
        }}
        showMobile={state.showMobileUpcoming}
        onToggleMobile={() => setState(prev => ({ ...prev, showMobileUpcoming: !prev.showMobileUpcoming }))}
      />
    </CalendarWrapper>
  );
};

export default MortuaryCalendar;