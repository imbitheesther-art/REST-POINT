import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  MessageCircle, 
  Search, 
  Send, 
  Paperclip, 
  Mic, 
  Image, 
  MoreVertical,
  Phone,
  Video,
  Smile,
  Menu,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  User,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import { useSocket } from '../../../context/socketContext';

// WhatsApp Colors
const PRIMARY_COLOR = '#075e54';
const SECONDARY_COLOR = '#128c7e';
const ACCENT_COLOR = '#25d366';
const CHAT_BG = '#e5ddd5';
const INCOMING_MSG_BG = '#ffffff';
const OUTGOING_MSG_BG = '#dcf8c6';
const TEXT_PRIMARY = '#303030';
const TEXT_SECONDARY = '#667781';
const BORDER_COLOR = '#e0e0e0';
const DANGER_COLOR = '#ff3b30';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const notificationPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
`;

// Styled Components
const WhatsAppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f0f0f0;
  font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
`;

// Sidebar
const Sidebar = styled.div`
  width: 400px;
  background: white;
  border-right: 1px solid ${BORDER_COLOR};
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 16px;
  background: ${PRIMARY_COLOR};
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const UserStatus = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const HeaderIcons = styled.div`
  display: flex;
  gap: 20px;
  color: white;
`;

const SearchContainer = styled.div`
  padding: 12px;
  background: white;
  border-bottom: 1px solid ${BORDER_COLOR};
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-radius: 20px;
  padding: 8px 16px;
  gap: 12px;
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  color: ${TEXT_PRIMARY};

  &::placeholder {
    color: ${TEXT_SECONDARY};
  }
`;

const FilterSection = styled.div`
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid ${BORDER_COLOR};
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const FilterButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 16px;
  background: white;
  color: ${TEXT_SECONDARY};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  ${({ active }) => active && css`
    background: ${PRIMARY_COLOR};
    color: white;
    border-color: ${PRIMARY_COLOR};
  `}
`;

const ChatsList = styled.div`
  flex: 1;
  overflow-y: auto;
  background: white;
`;

const ChatItem = styled.div`
  display: flex;
  padding: 16px;
  gap: 12px;
  border-bottom: 1px solid ${BORDER_COLOR};
  cursor: pointer;
  background: ${({ active }) => active ? '#f0f0f0' : 'white'};
  transition: background 0.2s;
  position: relative;

  &:hover {
    background: #f5f5f5;
  }

  ${({ urgent }) => urgent && css`
    border-left: 3px solid ${DANGER_COLOR};
  `}
`;

const ChatAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${PRIMARY_COLOR};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  position: relative;
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ChatName = styled.div`
  font-weight: 600;
  color: ${TEXT_PRIMARY};
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ChatTime = styled.div`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
`;

const LastMessage = styled.div`
  font-size: 14px;
  color: ${TEXT_SECONDARY};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UnreadBadge = styled.div`
  background: ${ACCENT_COLOR};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  animation: ${notificationPulse} 2s infinite;
`;

const PriorityBadge = styled.div`
  background: ${DANGER_COLOR};
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${ACCENT_COLOR};
  border: 2px solid white;
`;

// Main Chat Area
const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${CHAT_BG};
  background-image: url('data:image/svg+xml,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h100v100H0z" fill="none"/><path d="M25 25h50v50H25z" fill="rgba(0,0,0,0.03)"/></svg>');
`;


const ChatUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ChatHeaderIcons = styled.div`
  display: flex;
  gap: 20px;
  color: white;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageBubble = styled.div`
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 8px;
  position: relative;
  animation: ${fadeIn} 0.3s ease-out;
  word-wrap: break-word;

  ${({ isOwn }) => isOwn ? css`
    background: ${OUTGOING_MSG_BG};
    align-self: flex-end;
    border-top-right-radius: 0;
    margin-left: auto;
  ` : css`
    background: ${INCOMING_MSG_BG};
    align-self: flex-start;
    border-top-left-radius: 0;
  `}
`;

const MessageText = styled.div`
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  line-height: 1.4;
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: ${TEXT_SECONDARY};
  text-align: right;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`;

const MessageStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const InputContainer = styled.div`
  padding: 16px;
  background: ${PRIMARY_COLOR};
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`;

const InputWrapper = styled.div`
  flex: 1;
  background: white;
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 12px;
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  font-family: inherit;
  max-height: 100px;
  padding: 8px 0;

  &::placeholder {
    color: ${TEXT_SECONDARY};
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${TEXT_SECONDARY};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(0,0,0,0.1);
  }

  ${({ primary }) => primary && css`
    color: white;
    background: ${ACCENT_COLOR};
    
    &:hover {
      background: #20b858;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: none;
    }
  }
`;

const AttachmentMenu = styled.div`
  position: absolute;
  bottom: 70px;
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1000;
`;

const AttachmentButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

const NoChatSelected = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${CHAT_BG};
  color: ${TEXT_SECONDARY};
  text-align: center;
  padding: 40px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: ${PRIMARY_COLOR};
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const StatusBadge = styled.div`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ status }) => 
    status === 'open' ? '#e3f2fd' : 
    status === 'responded' ? '#e8f5e8' : 
    status === 'closed' ? '#f5f5f5' : '#fff3cd'};
  color: ${({ status }) => 
    status === 'open' ? '#1976d2' : 
    status === 'responded' ? '#2e7d32' : 
    status === 'closed' ? '#666' : '#f57c00'};
  border: 1px solid currentColor;
`;

// Audio Notification Component
const AudioNotification = ({ play }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [play]);

  return (
    <audio ref={audioRef} preload="auto">
      <source src="/audio/notification.mp3" type="audio/mpeg" />
      <source src="/audio/notification.wav" type="audio/wav" />
      <source src="/audio/notification.ogg" type="audio/ogg" />
    </audio>
  );
};

// Main Component
const StaffPortal = () => {
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [playNotification, setPlayNotification] = useState(false);
  const [staffName, setStaffName] = useState('Support Agent');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetchInquiries();
    
    // Get staff info from localStorage or context
    const staffInfo = JSON.parse(localStorage.getItem('staffInfo') || '{}');
    if (staffInfo.name) {
      setStaffName(staffInfo.name);
    }
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/inquiries');
      const result = await response.json();
      
      if (result.success) {
        const formattedChats = result.data.map(inquiry => ({
          id: inquiry.id,
          inquiry_id: inquiry.inquiry_id,
          client_name: inquiry.client_name,
          email: inquiry.email,
          phone: inquiry.phone,
          subject: inquiry.subject,
          last_message: inquiry.message,
          timestamp: new Date(inquiry.created_at),
          status: inquiry.status,
          priority: inquiry.priority,
          unread: inquiry.status === 'open' ? 1 : 0,
          messages: []
        }));
        
        setChats(formattedChats);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (inquiryId) => {
    try {
      const response = await fetch(`/api/staff/inquiries/${inquiryId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const inquiry = result.data;
        const formattedMessages = inquiry.responses.map(response => ({
          id: response.id,
          text: response.response,
          timestamp: new Date(response.created_at),
          isOwn: !!response.staff_name,
          status: 'read',
          staff_name: response.staff_name,
          staff_role: response.staff_role
        }));

        // Add the initial inquiry as a message
        if (inquiry.message) {
          formattedMessages.unshift({
            id: 'initial',
            text: inquiry.message,
            timestamp: new Date(inquiry.created_at),
            isOwn: false,
            status: 'read'
          });
        }

        return formattedMessages;
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
    return [];
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewInquiry = (inquiry) => {
      const newChat = {
        id: inquiry.id,
        inquiry_id: inquiry.inquiry_id,
        client_name: inquiry.client_name,
        email: inquiry.email,
        phone: inquiry.phone,
        subject: inquiry.subject,
        last_message: inquiry.message,
        timestamp: new Date(inquiry.created_at),
        status: inquiry.status,
        priority: inquiry.priority,
        unread: 1,
        messages: []
      };

      setChats(prev => [newChat, ...prev]);
      playNotificationSound();
    };

    const handleInquiryUpdated = (updatedInquiry) => {
      setChats(prev => prev.map(chat => 
        chat.id === updatedInquiry.id ? {
          ...chat,
          status: updatedInquiry.status,
          priority: updatedInquiry.priority,
          last_message: updatedInquiry.responses?.[updatedInquiry.responses.length - 1]?.response || chat.last_message
        } : chat
      ));

      if (selectedChat && selectedChat.id === updatedInquiry.id) {
        setSelectedChat(prev => ({
          ...prev,
          status: updatedInquiry.status,
          priority: updatedInquiry.priority,
          messages: formatInquiryToMessages(updatedInquiry)
        }));
      }
    };

    const handleNewResponse = (data) => {
      const { inquiry, response } = data;
      
      setChats(prev => prev.map(chat => {
        if (chat.id === inquiry.id) {
          const isSelected = selectedChat?.id === chat.id;
          return {
            ...chat,
            last_message: response.response,
            timestamp: new Date(response.created_at),
            unread: isSelected ? 0 : chat.unread + 1,
            status: response.is_internal_note ? chat.status : 'responded'
          };
        }
        return chat;
      }));

      if (selectedChat && selectedChat.id === inquiry.id) {
        const newMessage = {
          id: response.id,
          text: response.response,
          timestamp: new Date(response.created_at),
          isOwn: true,
          status: 'sent',
          staff_name: staffName
        };

        setSelectedChat(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage],
          status: response.is_internal_note ? prev.status : 'responded'
        }));

        // Update message status after a delay
        setTimeout(() => {
          setSelectedChat(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
            )
          }));
        }, 1000);
      } else {
        playNotificationSound();
      }
    };

    const handlePriorityInquiry = (inquiry) => {
      playNotificationSound();
      // You could show a toast notification here
      console.log('Priority inquiry received:', inquiry);
    };

    socket.on('new_inquiry', handleNewInquiry);
    socket.on('inquiry_updated', handleInquiryUpdated);
    socket.on('inquiry_response_added', handleNewResponse);
    socket.on('priority_inquiry', handlePriorityInquiry);

    return () => {
      socket.off('new_inquiry', handleNewInquiry);
      socket.off('inquiry_updated', handleInquiryUpdated);
      socket.off('inquiry_response_added', handleNewResponse);
      socket.off('priority_inquiry', handlePriorityInquiry);
    };
  }, [socket, selectedChat, staffName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const playNotificationSound = () => {
    setPlayNotification(true);
    setTimeout(() => setPlayNotification(false), 1000);
  };

  const handleSelectChat = async (chat) => {
    setLoading(true);
    
    // Mark as read
    setChats(prev => prev.map(c => 
      c.id === chat.id ? { ...c, unread: 0 } : c
    ));

    // Fetch full chat messages
    const messages = await fetchChatMessages(chat.inquiry_id);
    
    setSelectedChat({
      ...chat,
      messages,
      unread: 0
    });
    
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const messageData = {
      response: message,
      user_id: 1, // This should come from auth context
      is_internal_note: false
    };

    try {
      const response = await fetch(`/api/staff/inquiries/${selectedChat.inquiry_id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage('');
      } else {
        console.error('Failed to send message:', result.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateInquiryStatus = async (status) => {
    if (!selectedChat) return;

    try {
      const response = await fetch(`/api/staff/inquiries/${selectedChat.inquiry_id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      if (result.success) {
        setSelectedChat(prev => ({ ...prev, status }));
        setChats(prev => prev.map(chat => 
          chat.id === selectedChat.id ? { ...chat, status } : chat
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload
      console.log('File selected:', file);
      // You would implement file upload logic here
    }
    e.target.value = '';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === messageDate.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <Check size={14} />;
      case 'delivered':
        return <CheckCheck size={14} />;
      case 'read':
        return <CheckCheck size={14} color={ACCENT_COLOR} />;
      default:
        return <Clock size={14} />;
    }
  };

  const formatInquiryToMessages = (inquiry) => {
    const messages = [];

    // Add initial inquiry as message
    if (inquiry.message) {
      messages.push({
        id: 'initial',
        text: inquiry.message,
        timestamp: new Date(inquiry.created_at),
        isOwn: false,
        status: 'read'
      });
    }

    // Add responses
    if (inquiry.responses) {
      inquiry.responses.forEach(response => {
        messages.push({
          id: response.id,
          text: response.response,
          timestamp: new Date(response.created_at),
          isOwn: !!response.staff_name,
          status: 'read',
          staff_name: response.staff_name,
          staff_role: response.staff_role
        });
      });
    }

    return messages;
  };

  const filteredChats = chats.filter(chat => {
    const statusMatch = statusFilter === 'all' || chat.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || chat.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  return (
    <WhatsAppContainer>
      <AudioNotification play={playNotification} />
      
      {/* Sidebar */}
      <Sidebar>
        <SidebarHeader>
          <UserInfo>
            <UserAvatar>{getInitials(staffName)}</UserAvatar>
            <UserDetails>
              <UserName>{staffName}</UserName>
              <UserStatus>Online</UserStatus>
            </UserDetails>
          </UserInfo>
          <HeaderIcons>
            <Menu size={20} />
          </HeaderIcons>
        </SidebarHeader>

        <SearchContainer>
          <SearchBox>
            <Search size={18} color={TEXT_SECONDARY} />
            <SearchInput 
              placeholder="Search conversations..."
            />
          </SearchBox>
        </SearchContainer>

        <FilterSection>
          <FilterButton 
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </FilterButton>
          <FilterButton 
            active={statusFilter === 'open'}
            onClick={() => setStatusFilter('open')}
          >
            Open
          </FilterButton>
          <FilterButton 
            active={statusFilter === 'responded'}
            onClick={() => setStatusFilter('responded')}
          >
            Responded
          </FilterButton>
          <FilterButton 
            active={priorityFilter === 'high'}
            onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
          >
            <AlertCircle size={12} />
            Urgent
          </FilterButton>
        </FilterSection>

        <ChatsList>
          {loading ? (
            <LoadingSpinner>
              <Search size={20} />
            </LoadingSpinner>
          ) : filteredChats.map(chat => (
            <ChatItem 
              key={chat.id}
              active={selectedChat?.id === chat.id}
              urgent={chat.priority === 'high'}
              onClick={() => handleSelectChat(chat)}
            >
              <ChatAvatar>
                {getInitials(chat.client_name)}
                {chat.priority === 'high' && <OnlineIndicator />}
              </ChatAvatar>
              <ChatInfo>
                <ChatHeader>
                  <ChatName>
                    {chat.client_name}
                    {chat.priority === 'high' && (
                      <PriorityBadge>URGENT</PriorityBadge>
                    )}
                  </ChatName>
                  <ChatTime>{formatTime(chat.timestamp)}</ChatTime>
                </ChatHeader>
                <LastMessage>
                  {chat.status !== 'open' && (
                    <StatusBadge status={chat.status}>
                      {chat.status}
                    </StatusBadge>
                  )}
                  {chat.last_message}
                </LastMessage>
              </ChatInfo>
              {chat.unread > 0 && <UnreadBadge>{chat.unread}</UnreadBadge>}
            </ChatItem>
          ))}
          
          {!loading && filteredChats.length === 0 && (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: TEXT_SECONDARY 
            }}>
              <MessageCircle size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div>No conversations found</div>
              <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
                {statusFilter !== 'all' ? 'Try changing filters' : 'New inquiries will appear here'}
              </div>
            </div>
          )}
        </ChatsList>
      </Sidebar>

      {/* Main Chat Area */}
      <ChatContainer>
        {selectedChat ? (
          <>
            <ChatHeader>
              <ChatUserInfo>
                <ChatAvatar style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                  {getInitials(selectedChat.client_name)}
                  {selectedChat.priority === 'high' && <OnlineIndicator />}
                </ChatAvatar>
                <UserDetails>
                  <UserName>{selectedChat.client_name}</UserName>
                  <UserStatus>
                    <StatusBadge status={selectedChat.status}>
                      {selectedChat.status}
                    </StatusBadge>
                    {selectedChat.priority === 'high' && ' • URGENT'}
                  </UserStatus>
                </UserDetails>
              </ChatUserInfo>
              <ChatHeaderIcons>
                <Phone size={20} />
                <Video size={20} />
                <MoreVertical size={20} />
              </ChatHeaderIcons>
            </ChatHeader>

            <MessagesContainer>
              {selectedChat.messages.map(message => (
                <MessageBubble key={message.id} isOwn={message.isOwn}>
                  {message.staff_name && (
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: PRIMARY_COLOR,
                      marginBottom: '2px'
                    }}>
                      {message.staff_name}
                    </div>
                  )}
                  <MessageText>{message.text}</MessageText>
                  <MessageTime>
                    {formatTime(message.timestamp)}
                    {message.isOwn && (
                      <MessageStatus>
                        {renderMessageStatus(message.status)}
                      </MessageStatus>
                    )}
                  </MessageTime>
                </MessageBubble>
              ))}
              <div ref={messagesEndRef} />
            </MessagesContainer>

            <InputContainer>
              {showAttachments && (
                <AttachmentMenu>
                  <AttachmentButton onClick={() => fileInputRef.current?.click()}>
                    <Image size={18} />
                    Photo & Video
                  </AttachmentButton>
                  <AttachmentButton>
                    <Paperclip size={18} />
                    Document
                  </AttachmentButton>
                  <AttachmentButton>
                    <Mic size={18} />
                    Audio
                  </AttachmentButton>
                </AttachmentMenu>
              )}
              
              <IconButton onClick={() => setShowAttachments(!showAttachments)}>
                <Paperclip size={20} />
              </IconButton>
              
              <IconButton>
                <Smile size={20} />
              </IconButton>

              <InputWrapper>
                <MessageInput
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows="1"
                />
              </InputWrapper>

              <IconButton 
                primary 
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                <Send size={20} />
              </IconButton>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
            </InputContainer>
          </>
        ) : (
          <NoChatSelected>
            <MessageCircle size={64} color={TEXT_SECONDARY} />
            <div style={{ marginTop: '16px', fontSize: '24px', fontWeight: '300' }}>
              Support Portal
            </div>
            <div style={{ marginTop: '16px', maxWidth: '500px', lineHeight: '1.5' }}>
              Select a conversation from the sidebar to start helping customers. 
              You'll be notified when new inquiries come in with sound alerts.
            </div>
          </NoChatSelected>
        )}
      </ChatContainer>
    </WhatsAppContainer>
  );
};

export default StaffPortal;