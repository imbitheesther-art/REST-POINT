import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Check, Loader2, ClipboardList, AlertTriangle, 
  XCircle, CheckCircle, Info, Calendar, ChevronLeft, 
  ChevronRight, CalendarDays, X, Calendar as CalendarIcon,
  User, MapPin, Crosshair, Fingerprint, Hospital, HeartPulse,
  ArrowRight
} from 'lucide-react';

// --- Configuration ---
const API_ENDPOINT = 'http://localhost:5000/api/v1/restpoint/register-deceased';

// --- Improved Toast Notification ---
const NotificationToast = ({ notification, setNotification }) => {
  useEffect(() => {
    if (notification.isVisible) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, notification.type === 'success' ? 3000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  if (!notification.isVisible) return null;

  const icons = {
    success: <CheckCircle className="me-2" size={20} />,
    error: <XCircle className="me-2" size={20} />,
    info: <Info className="me-2" size={20} />,
    alert: <AlertTriangle className="me-2" size={20} />,
  };

  const bgColors = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-info',
    alert: 'bg-warning',
  };

  return (
    <div className="position-fixed top-0 end-0 m-3" style={{ zIndex: 9999 }}>
      <div className={`toast show ${bgColors[notification.type] || 'bg-info'} text-white shadow-lg`} role="alert">
        <div className="toast-header bg-transparent border-0 text-white">
          <strong className="me-auto">{notification.title}</strong>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setNotification(prev => ({ ...prev, isVisible: false }))}
            aria-label="Close"
          />
        </div>
        <div className="toast-body d-flex align-items-center">
          {icons[notification.type]}
          <span>{notification.message}</span>
        </div>
      </div>
    </div>
  );
};

// --- Compact Mobile Calendar Component ---
const CompactCalendar = ({ selectedDate, onChange, maxDate = new Date(), placeholder = "Select Date", fieldErrors = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [view, setView] = useState('days');
  const calendarRef = useRef(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonthIndex);
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonthIndex, i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate <= maxDate) {
        onChange(selectedDate);
        setIsOpen(false);
        setView('days');
      }
    }
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentYear, monthIndex, 1);
    setCurrentMonth(newDate);
    setView('days');
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(year, currentMonthIndex, 1);
    setCurrentMonth(newDate);
    setView('months');
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentYear, currentMonthIndex + direction, 1);
    setCurrentMonth(newDate);
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    return date > maxDate;
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const formatDateDisplay = (date) => {
    if (!date) return placeholder;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Position calendar modal
  const updateModalPosition = () => {
    if (modalRef.current && isOpen) {
      if (isMobile) {
        // Mobile: smaller bottom modal
        modalRef.current.style.position = 'fixed';
        modalRef.current.style.bottom = '0';
        modalRef.current.style.left = '0';
        modalRef.current.style.right = '0';
        modalRef.current.style.top = 'auto';
        modalRef.current.style.width = '100%';
        modalRef.current.style.maxHeight = '60vh'; // Smaller height
        modalRef.current.style.borderRadius = '16px 16px 0 0';
        modalRef.current.style.transform = 'none';
      }
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && 
          !calendarRef.current.contains(event.target) && 
          modalRef.current && 
          !modalRef.current.contains(event.target)) {
        setIsOpen(false);
        setView('days');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('resize', updateModalPosition);
      
      // Prevent body scroll on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
      
      setTimeout(updateModalPosition, 10);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('resize', updateModalPosition);
      
      if (isMobile) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, isMobile]);

  const handleInputClick = () => {
    setIsOpen(!isOpen);
    setTimeout(updateModalPosition, 10);
  };

  const canNavigateNext = view === 'days' && 
    (currentYear < maxDate.getFullYear() || 
     (currentYear === maxDate.getFullYear() && currentMonthIndex < maxDate.getMonth()));

  const days = generateDays();

  return (
    <div className="compact-calendar-wrapper position-relative" ref={calendarRef}>
      <div className="input-group" ref={inputRef}>
        <span className="input-group-text bg-white border-end-0">
          <CalendarIcon size={18} className="text-primary" />
        </span>
        <input
          type="text"
          className={`form-control border-start-0 rounded-end-2 p-3 ${fieldErrors ? 'is-invalid' : ''}`}
          value={formatDateDisplay(selectedDate)}
          readOnly
          placeholder={placeholder}
          onClick={handleInputClick}
          style={{ 
            cursor: 'pointer', 
            fontSize: isMobile ? '16px' : '0.9rem',
            minHeight: '48px',
            backgroundColor: 'white'
          }}
        />
      </div>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div 
              className="calendar-backdrop position-fixed top-0 left-0 right-0 bottom-0 bg-dark bg-opacity-50"
              style={{ zIndex: 99998 }}
              onClick={() => {
                setIsOpen(false);
                setView('days');
              }}
            />
          )}
          
          <div 
            ref={modalRef}
            className={`calendar-modal ${isMobile ? 'mobile-modal' : 'desktop-modal'} shadow-lg border bg-white`}
            style={{ zIndex: 99999 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Calendar Header - Compact */}
            <div className="calendar-header d-flex justify-content-between align-items-center p-2 border-bottom bg-light">
              <div className="d-flex align-items-center">
                <Calendar size={18} className="text-primary me-2" />
                <span className="fw-bold" style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>Select Date</span>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setIsOpen(false);
                  setView('days');
                }}
                aria-label="Close"
              />
            </div>
            
            <div className="calendar-content p-2" style={{ 
              maxHeight: isMobile ? 'calc(60vh - 100px)' : '350px',
              overflowY: 'auto'
            }}>
              {/* Compact Navigation */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
                  onClick={() => navigateMonth(-1)}
                  disabled={view !== 'days'}
                  style={{ 
                    width: isMobile ? '36px' : '32px',
                    height: isMobile ? '36px' : '32px',
                    borderRadius: '6px'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className={`btn btn-sm px-2 ${view === 'months' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setView(view === 'months' ? 'days' : 'months')}
                    style={{ 
                      fontSize: isMobile ? '0.85rem' : '0.8rem',
                      fontWeight: '600',
                      borderRadius: '6px',
                      minWidth: isMobile ? '70px' : '60px'
                    }}
                  >
                    {months[currentMonthIndex]}
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm px-2 ${view === 'years' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setView(view === 'years' ? 'days' : 'years')}
                    style={{ 
                      fontSize: isMobile ? '0.85rem' : '0.8rem',
                      fontWeight: '600',
                      borderRadius: '6px',
                      minWidth: isMobile ? '60px' : '50px'
                    }}
                  >
                    {currentYear}
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
                  onClick={() => navigateMonth(1)}
                  disabled={!canNavigateNext}
                  style={{ 
                    width: isMobile ? '36px' : '32px',
                    height: isMobile ? '36px' : '32px',
                    borderRadius: '6px'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Calendar Content */}
              {view === 'days' && (
                <>
                  <div className="calendar-weekdays d-grid text-center mb-1" style={{ 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    gap: '2px'
                  }}>
                    {weekDays.map(day => (
                      <div key={day} className="text-muted fw-semibold p-1" style={{ 
                        fontSize: isMobile ? '0.7rem' : '0.65rem' 
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="calendar-days d-grid" style={{ 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    gap: '2px'
                  }}>
                    {days.map((date, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`btn btn-sm d-flex align-items-center justify-content-center ${
                          !date ? 'invisible' : ''
                        } ${
                          date && isSameDay(date, selectedDate) 
                            ? 'btn-primary text-white' 
                            : isToday(date)
                              ? 'btn-light border-primary text-primary'
                              : isDateDisabled(date)
                                ? 'btn-light text-muted opacity-50' 
                                : 'btn-light'
                        }`}
                        disabled={isDateDisabled(date)}
                        onClick={() => handleDateSelect(date)}
                        style={{ 
                          height: isMobile ? '36px' : '32px',
                          borderRadius: '4px',
                          fontSize: isMobile ? '0.8rem' : '0.75rem',
                          padding: '0'
                        }}
                      >
                        {date ? date.getDate() : ''}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {view === 'months' && (
                <div className="calendar-months d-grid" style={{ 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '4px'
                }}>
                  {months.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      className={`btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center ${
                        index === currentMonthIndex ? 'btn-primary text-white' : ''
                      }`}
                      onClick={() => handleMonthSelect(index)}
                      style={{ 
                        height: isMobile ? '45px' : '40px',
                        borderRadius: '6px',
                        fontSize: isMobile ? '0.8rem' : '0.75rem'
                      }}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}

              {view === 'years' && (
                <div className="calendar-years" style={{ 
                  maxHeight: isMobile ? '150px' : '200px', 
                  overflowY: 'auto'
                }}>
                  <div className="d-grid" style={{ 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '4px'
                  }}>
                    {years.map(year => (
                      <button
                        key={year}
                        type="button"
                        className={`btn btn-sm d-flex align-items-center justify-content-center ${
                          year === currentYear ? 'btn-primary text-white' : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleYearSelect(year)}
                        style={{ 
                          height: isMobile ? '45px' : '40px',
                          borderRadius: '6px',
                          fontSize: isMobile ? '0.8rem' : '0.75rem'
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Compact Footer */}
            <div className="calendar-footer p-2 border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex flex-column">
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    Selected
                  </small>
                  <span className="fw-bold" style={{ fontSize: isMobile ? '0.85rem' : '0.8rem' }}>
                    {selectedDate ? formatDateDisplay(selectedDate) : 'None'}
                  </span>
                </div>
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleDateSelect(today)}
                    disabled={today > maxDate}
                    style={{ 
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setIsOpen(false);
                      setView('days');
                    }}
                    style={{ 
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      padding: '0.25rem 0.75rem'
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .calendar-modal {
          animation: slideUp 0.2s ease-out;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
          border: 1px solid #e9ecef;
          background: white;
        }
        
        .mobile-modal {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          top: auto !important;
          width: 100% !important;
          max-height: 60vh !important;
          border-radius: 16px 16px 0 0 !important;
          border-bottom: none !important;
        }
        
        .desktop-modal {
          position: absolute !important;
          top: 100% !important;
          left: 0 !important;
          width: 320px !important;
          max-height: 400px !important;
          border-radius: 8px !important;
          margin-top: 4px !important;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .calendar-backdrop {
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .calendar-years::-webkit-scrollbar {
          width: 4px;
        }
        
        .calendar-years::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .calendar-years::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

// --- Utility Functions ---
const getRegisteredByUsername = () => {
  try {
    const stored = localStorage.getItem('user') || localStorage.getItem('user_info');
    if (!stored) return 'Unknown User';

    const user = typeof stored === 'string' ? JSON.parse(stored) : stored;

    const username =
      user.username ||
      user.name ||
      user.full_name ||
      (user.id ? `User-${user.id}` : null);

    return username || 'System User';
  } catch (e) {
    console.warn("Error reading user info from localStorage:", e);
    return 'Unknown User';
  }
};

const parseDateString = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const [year, month, day] = dateString.split('-');
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
    date.setHours(0, 0, 0, 0);
    return date;
  } catch (error) {
    console.warn('Error parsing date:', dateString, error);
    return null;
  }
};

const formatDateToISO = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return '';
  }
};

// --- Form Input Components ---
const TextInput = React.memo(({ name, value, onChange, errors, label, type = "text", required = true, icon = null, ...props }) => {
  const IconComponent = icon;
  
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label fw-semibold mb-2 d-flex align-items-center">
        {IconComponent && <IconComponent size={16} className="me-2 text-primary" />}
        {label || name.replace(/_/g, ' ')}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <div className="input-group">
        {IconComponent && (
          <span className="input-group-text bg-white border-end-0">
            <IconComponent size={16} className="text-muted" />
          </span>
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value || ''}
          onChange={onChange}
          className={`form-control ${IconComponent ? 'border-start-0' : ''} ${errors[name] ? 'is-invalid' : ''} rounded-2 p-3`}
          required={required}
          style={{ 
            fontSize: '1rem', 
            minHeight: '48px',
            backgroundColor: 'white'
          }}
          {...props}
        />
      </div>
      {errors[name] && (
        <div className="invalid-feedback d-flex align-items-center mt-2">
          <AlertTriangle size={14} className="me-1 text-danger" />
          <span style={{ fontSize: '0.85rem' }}>{errors[name]}</span>
        </div>
      )}
    </div>
  );
});

const SelectInput = React.memo(({ name, value, onChange, errors, label, options, required = true, icon = null, ...props }) => {
  const IconComponent = icon;
  
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label fw-semibold mb-2 d-flex align-items-center">
        {IconComponent && <IconComponent size={16} className="me-2 text-primary" />}
        {label || name.replace(/_/g, ' ')}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <div className="input-group">
        {IconComponent && (
          <span className="input-group-text bg-white border-end-0">
            <IconComponent size={16} className="text-muted" />
          </span>
        )}
        <select
          name={name}
          id={name}
          value={value || ''}
          onChange={onChange}
          className={`form-select ${IconComponent ? 'border-start-0' : ''} ${errors[name] ? 'is-invalid' : ''} rounded-2 p-3`}
          required={required}
          style={{ 
            fontSize: '1rem', 
            minHeight: '48px',
            backgroundColor: 'white'
          }}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {errors[name] && (
        <div className="invalid-feedback d-flex align-items-center mt-2">
          <AlertTriangle size={14} className="me-1 text-danger" />
          <span style={{ fontSize: '0.85rem' }}>{errors[name]}</span>
        </div>
      )}
    </div>
  );
});

const DateFieldInput = React.memo(({ name, value, onChange, errors, label, required = true, icon = null }) => {
  const IconComponent = icon;
  const dateObject = parseDateString(value);
  const hasError = errors[name];

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label fw-semibold mb-2 d-flex align-items-center">
        {IconComponent && <IconComponent size={16} className="me-2 text-primary" />}
        {label || name.replace(/_/g, ' ')}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <CompactCalendar
        selectedDate={dateObject}
        onChange={(date) => onChange(date, name)}
        maxDate={new Date()}
        placeholder={`Select ${label || name.replace(/_/g, ' ')}`}
        fieldErrors={hasError}
      />
      {hasError && (
        <div className="text-danger small d-flex align-items-center mt-2">
          <AlertTriangle size={12} className="me-1" />
          <span style={{ fontSize: '0.85rem' }}>{errors[name]}</span>
        </div>
      )}
    </div>
  );
});

// --- Main Component ---
const DeceasedRegistrationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    isVisible: false, 
    type: 'info', 
    title: '', 
    message: '',
  });

  const initialFormData = useMemo(() => ({
    full_name: '', national_id: '', gender: '', date_of_birth: '',
    date_of_death: '', place_of_death: '', cause_of_death: '',
    admission_number: '', date_admitted: '', county: '', location: '',
  }), []);

  const [formData, setFormData] = useState(initialFormData);

  // Auto-hide success notification and redirect
  useEffect(() => {
    if (notification.type === 'success' && notification.isVisible) {
      const timer = setTimeout(() => {
        navigate('/deceased-list');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notification, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date, name) => {
    const isoString = formatDateToISO(date);
    setFormData(prev => ({ 
      ...prev, 
      [name]: isoString 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const allFormFields = useMemo(() => Object.keys(initialFormData), [initialFormData]);

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    allFormFields.forEach(key => {
      const value = formData[key];
      const isRequired = key !== 'admission_number' && key !== 'date_admitted'; 

      if (isRequired && (!value || (typeof value === 'string' && value.trim() === ''))) {
        const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        newErrors[key] = `${fieldName} is required.`;
      }

      if (key.includes('date_') && value) {
        const dateValue = parseDateString(value);
        if (dateValue && dateValue > today) {
          newErrors[key] = `Date cannot be in the future.`;
        }
      }
    });

    if (formData.date_of_birth && formData.date_of_death) {
      const birthDate = parseDateString(formData.date_of_birth);
      const deathDate = parseDateString(formData.date_of_death);
      
      if (birthDate && deathDate && birthDate >= deathDate) {
        newErrors.date_of_death = "Date of Death must be after Date of Birth.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setNotification({
        isVisible: true, 
        type: 'error', 
        title: 'Validation Error 🛑',
        message: 'Please fill in all required fields correctly before submitting.',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        ...formData, 
        registered_by: getRegisteredByUsername() 
      };

      console.log('Submitting payload:', payload);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({
          isVisible: true, 
          type: 'success', 
          title: 'Success! 🎉',
          message: 'Deceased record registered successfully! Redirecting...',
        });
        setFormData(initialFormData); 
        setErrors({});
      } else {
        setNotification({
          isVisible: true, 
          type: 'error', 
          title: 'Registration Failed 😟',
          message: result.message || `Server error: ${response.status} ${response.statusText}.`,
        });
      }
    } catch (error) {
      console.error('Error registering deceased:', error);
      setNotification({
        isVisible: true, 
        type: 'error', 
        title: 'Network Error 🔌',
        message: 'Could not connect to the server. Check if http://localhost:5000 is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0" 
         style={{ 
           fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
           background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)'
         }}>
      <NotificationToast notification={notification} setNotification={setNotification} />
      
      {/* Page Header */}
      <div className="bg-primary text-white py-4 px-3 shadow-sm">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-circle me-3">
                <UserPlus size={24} />
              </div>
              <div>
                <h1 className="h3 fw-bold mb-1">Register Deceased</h1>
                <p className="mb-0 opacity-75" style={{ fontSize: '0.9rem' }}>
                  Fill in the details below to register a new deceased record
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => {
                setFormData(initialFormData);
                setErrors({});
              }}
              style={{ borderRadius: '8px' }}
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h2 className="h4 fw-bold text-dark mb-2 d-flex align-items-center">
                  <ClipboardList size={24} className="text-primary me-2" />
                  Deceased Registration Form
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  All fields marked with <span className="text-danger fw-bold">*</span> are required
                </p>
              </div>

              <div className="card-body p-3 p-md-4">
                <form onSubmit={handleSubmit}>
                  {/* Personal Details Section */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                        <User size={18} className="text-primary" />
                      </div>
                      <h3 className="h5 fw-bold mb-0 text-dark">Personal Details</h3>
                    </div>
                    
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <TextInput 
                          name="full_name" 
                          value={formData.full_name} 
                          onChange={handleChange} 
                          errors={errors} 
                          label="Full Name"
                          icon={User}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <TextInput 
                          name="national_id" 
                          value={formData.national_id} 
                          onChange={handleChange} 
                          errors={errors} 
                          label="National ID"
                          icon={Fingerprint}
                          placeholder="Enter national ID"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <SelectInput
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          errors={errors}
                          label="Gender"
                          icon={User}
                          options={[
                            { value: '', label: 'Select Gender', disabled: true },
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                            { value: 'Other', label: 'Other' },
                          ]}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <DateFieldInput 
                          name="date_of_birth" 
                          value={formData.date_of_birth} 
                          onChange={handleDateChange} 
                          errors={errors} 
                          label="Date of Birth"
                          icon={CalendarDays}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Death Details Section */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-danger bg-opacity-10 p-2 rounded me-3">
                        <Crosshair size={18} className="text-danger" />
                      </div>
                      <h3 className="h5 fw-bold mb-0 text-dark">Death Details</h3>
                    </div>
                    
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <DateFieldInput 
                          name="date_of_death" 
                          value={formData.date_of_death} 
                          onChange={handleDateChange} 
                          errors={errors} 
                          label="Date of Death"
                          icon={CalendarDays}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <TextInput 
                          name="place_of_death" 
                          value={formData.place_of_death} 
                          onChange={handleChange} 
                          errors={errors} 
                          label="Place of Death"
                          icon={Hospital}
                          placeholder="Hospital, home, etc."
                        />
                      </div>
                      <div className="col-12">
                        <TextInput 
                          name="cause_of_death" 
                          value={formData.cause_of_death} 
                          onChange={handleChange} 
                          errors={errors} 
                          label="Cause of Death"
                          icon={HeartPulse}
                          placeholder="Enter cause of death"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <TextInput 
                          name="admission_number" 
                          value={formData.admission_number} 
                          onChange={handleChange} 
                          errors={errors} 
                          label="Admission Number (Optional)"
                          icon={Hospital}
                          required={false}
                          placeholder="If applicable"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <DateFieldInput 
                          name="date_admitted" 
                          value={formData.date_admitted} 
                          onChange={handleDateChange} 
                          errors={errors} 
                          label="Date Admitted (Optional)"
                          icon={CalendarDays}
                          required={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Details Section */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                        <MapPin size={18} className="text-success" />
                      </div>
                      <h3 className="h5 fw-bold mb-0 text-dark">Location Details</h3>
                    </div>
                    
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <TextInput 
                          name="county" 
                          value={formData.county} 
                          onChange={handleChange} 
                          errors={errors} 
                          label="County / Region"
                          icon={MapPin}
                          placeholder="Enter county or region"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <TextInput 
                          name="location" 
                          value={formData.location} 
                          onChange={handleChange} 
                          errors={errors} 
                          label="Location / Sub-county"
                          icon={MapPin}
                          placeholder="Enter specific location"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 border-top">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-lg w-100 fw-bold d-flex align-items-center justify-content-center py-3"
                      style={{ 
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                        border: 'none',
                        fontSize: '1.1rem'
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin me-3" size={20} />
                          <span>Registering Deceased...</span>
                        </>
                      ) : (
                        <>
                          <Check size={20} className="me-3" /> 
                          <span>Register Deceased Record</span>
                          <ArrowRight size={20} className="ms-2" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-muted mb-4">
              <p className="mb-0" style={{ fontSize: '0.875rem' }}>
                Ensure all information is accurate before submitting. 
                Upon successful registration, you will be redirected to the deceased records page.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
          border-color: #86b7fe;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .container-fluid {
            padding: 0 !important;
          }
          
          .container {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .card-body {
            padding: 1rem !important;
          }
          
          .form-control, .form-select {
            font-size: 16px !important;
          }
          
          .btn-lg {
            padding: 1rem !important;
            font-size: 1rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .bg-primary.py-4 {
            padding: 1rem !important;
          }
          
          .bg-primary .d-flex {
            flex-direction: column;
            align-items: flex-start !important;
          }
          
          .bg-primary .btn-light {
            margin-top: 1rem;
            width: 100%;
          }
          
          .card-header h2 {
            font-size: 1.1rem !important;
          }
          
          .row.g-3 > div {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

// Load Bootstrap CSS
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
  document.head.appendChild(link);
}

export default DeceasedRegistrationForm;