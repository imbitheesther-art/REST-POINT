import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Paperclip, Send, MessageSquare, CornerDownRight, User, Clock } from 'lucide-react';
import { useSocket } from '../../../context/socketContext';

const messageIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PRIMARY_COLOR = '#075e54';
const SECONDARY_COLOR = '#25d366';
const BACKGROUND_COLOR = '#ece5dd';
const CLIENT_BUBBLE_COLOR = '#dcf8c6';
const STAFF_BUBBLE_COLOR = '#ffffff';

const ChatWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 1.5rem auto;
  height: 85vh;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  background: ${BACKGROUND_COLOR};
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background: ${PRIMARY_COLOR};
  color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 1.1rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusBadge = styled.div`
  background: rgba(255,255,255,0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const ChatBody = styled.div`
  flex-grow: 1;
  padding: 15px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-image: url('data:image/svg+xml,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h100v100H0z" fill="none"/><path d="M25 25h50v50H25z" fill="rgba(0,0,0,0.03)"/></svg>');
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.4;
  word-wrap: break-word;
  animation: ${messageIn} 0.3s ease-out;
  align-self: ${({ sender }) => (sender === 'client' ? 'flex-end' : 'flex-start')};
  background: ${({ sender }) => (sender === 'client' ? CLIENT_BUBBLE_COLOR : STAFF_BUBBLE_COLOR)};
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  position: relative;
  
  ${({ sender }) => sender === 'client' && `
    border-bottom-right-radius: 2px;
  `}
  
  ${({ sender }) => sender !== 'client' && `
    border-bottom-left-radius: 2px;
  `}
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
`;

const MessageSender = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${PRIMARY_COLOR};
`;

const MessageTime = styled.div`
  font-size: 0.7rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MessageContent = styled.div`
  font-size: 0.95rem;
  color: #333;
`;

const ChatFooter = styled.form`
  background: #f0f0f0;
  padding: 12px 20px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border-top: 1px solid #ddd;
`;

const InputContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
  background: white;
  border-radius: 24px;
  padding: 8px 16px;
  gap: 8px;
`;

const ChatInput = styled.textarea`
  flex: 1;
  border: none;
  resize: none;
  outline: none;
  font-size: 15px;
  font-family: inherit;
  max-height: 80px;
  padding: 8px 0;
  
  &::placeholder {
    color: #999;
  }
`;

const IconButton = styled.button`
  border: none;
  background: ${({ type }) => (type === 'submit' ? SECONDARY_COLOR : 'transparent')};
  color: ${({ type }) => (type === 'submit' ? 'white' : PRIMARY_COLOR)};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ type }) => (type === 'submit' ? '#20b858' : 'rgba(0,0,0,0.1)')};
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const WelcomeContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
`;

const FormArea = styled.div`
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledFormInput = styled.input`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: ${PRIMARY_COLOR};
  }
`;

const StartChatButton = styled.button`
  background: ${SECONDARY_COLOR};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
  
  &:hover:not(:disabled) {
    background: #20b858;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SystemMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
  margin: 8px 0;
  padding: 8px;
  background: rgba(255,255,255,0.5);
  border-radius: 16px;
  max-width: 60%;
  align-self: center;
`;

const TypingIndicator = styled.div`
  align-self: flex-start;
  background: ${STAFF_BUBBLE_COLOR};
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

const ClientChat = () => {
  const { socket } = useSocket();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInquiry, setCurrentInquiry] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setConnectionStatus('connected');
    const handleDisconnect = () => setConnectionStatus('disconnected');

    // Handle new inquiry creation
    const handleInquiryCreated = (data) => {
      if (data.success && data.data) {
        setCurrentInquiry(data.data);
        addSystemMessage('Support team has received your inquiry. They will respond shortly.');
      }
    };

    // Handle staff responses
    const handleNewStaffResponse = (data) => {
      if (data.inquiry && data.response) {
        const staffMessage = {
          id: Date.now(),
          text: data.response.response,
          sender: 'staff',
          timestamp: new Date(data.response.created_at),
          staff_name: data.response.staff_name || 'Support Agent'
        };
        
        setChatHistory(prev => [...prev, staffMessage]);
        setIsTyping(false);
      }
    };

    // Handle inquiry updates
    const handleInquiryUpdated = (inquiry) => {
      if (currentInquiry && inquiry.id === currentInquiry.id) {
        setCurrentInquiry(prev => ({ ...prev, status: inquiry.status }));
      }
    };

    // Handle typing indicators
    const handleStaffTyping = (data) => {
      if (data.inquiry_id === currentInquiry?.id) {
        setIsTyping(data.typing);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('inquiry_created', handleInquiryCreated);
    socket.on('inquiry_response_added', handleNewStaffResponse);
    socket.on('inquiry_updated', handleInquiryUpdated);
    socket.on('staff_typing', handleStaffTyping);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('inquiry_created', handleInquiryCreated);
      socket.off('inquiry_response_added', handleNewStaffResponse);
      socket.off('inquiry_updated', handleInquiryUpdated);
      socket.off('staff_typing', handleStaffTyping);
    };
  }, [socket, currentInquiry]);

  const addSystemMessage = (text) => {
    const systemMsg = {
      id: Date.now(),
      text,
      sender: 'system',
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, systemMsg]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!socket || !socket.connected) {
      addSystemMessage('Connection lost. Please refresh the page.');
      return;
    }

    const text = message.trim();
    if (!text) return;

    // Create client message
    const clientMessage = {
      id: Date.now(),
      text: text,
      sender: 'client',
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, clientMessage]);
    setMessage('');

    if (!currentInquiry) {
      // Create new inquiry
      const inquiryData = {
        client_name: clientName,
        email: clientEmail || null,
        subject: 'Live Chat Inquiry',
        message: text,
        priority: 'medium'
      };

      try {
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inquiryData)
        });

        const result = await response.json();
        
        if (result.success) {
          setCurrentInquiry(result.data);
          addSystemMessage('Your inquiry has been submitted. Our team will respond shortly.');
          
          // Emit socket event for real-time update
          socket.emit('new_inquiry', result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Error creating inquiry:', error);
        addSystemMessage('Failed to send message. Please try again.');
        // Remove the optimistic message
        setChatHistory(prev => prev.filter(msg => msg.id !== clientMessage.id));
      }
    } else {
      // Send message to existing inquiry
      const messageData = {
        inquiry_id: currentInquiry.id,
        client_name: clientName,
        response: text,
        created_at: new Date().toISOString()
      };

      socket.emit('new_client_message', messageData);
    }
  };

  const handleStartChat = () => {
    if (clientName.trim().length === 0) {
      alert('Please enter your name to start chatting');
      return;
    }
    addSystemMessage(`Chat started with ${clientName}. You will be connected to our support team shortly.`);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (!currentInquiry) {
    return (
      <ChatWrapper>
        <ChatHeader>
          <HeaderLeft>
            <MessageSquare size={20} />
            Live Support Chat
          </HeaderLeft>
          <StatusBadge>
            {connectionStatus === 'connected' ? '🟢 Online' : '🔴 Offline'}
          </StatusBadge>
        </ChatHeader>
        <WelcomeContainer>
          <MessageSquare size={48} color={PRIMARY_COLOR} style={{ marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '8px', color: PRIMARY_COLOR }}>Welcome to Support</h2>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            Start a conversation with our support team. We're here to help!
          </p>
          <FormArea>
            <StyledFormInput
              type="text"
              placeholder="Your Name *"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <StyledFormInput
              type="email"
              placeholder="Your Email (optional)"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            <StartChatButton 
              disabled={!clientName.trim()} 
              onClick={handleStartChat}
            >
              <CornerDownRight size={18} />
              Start Chat
            </StartChatButton>
          </FormArea>
        </WelcomeContainer>
      </ChatWrapper>
    );
  }

  return (
    <ChatWrapper>
      <ChatHeader>
        <HeaderLeft>
          <MessageSquare size={20} />
          {clientName} | Support Team
        </HeaderLeft>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusBadge>
            {currentInquiry.status || 'open'}
          </StatusBadge>
          <StatusBadge>
            {connectionStatus === 'connected' ? '🟢 Online' : '🔴 Offline'}
          </StatusBadge>
        </div>
      </ChatHeader>

      <ChatBody ref={chatRef}>
        {chatHistory.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <SystemMessage key={msg.id}>
                {msg.text}
              </SystemMessage>
            );
          }

          return (
            <MessageBubble key={msg.id} sender={msg.sender}>
              {msg.sender !== 'client' && msg.staff_name && (
                <MessageHeader>
                  <MessageSender>
                    <User size={12} style={{ marginRight: '4px' }} />
                    {msg.staff_name}
                  </MessageSender>
                </MessageHeader>
              )}
              <MessageContent>{msg.text}</MessageContent>
              <MessageTime>
                <Clock size={10} style={{ marginRight: '4px' }} />
                {formatTime(msg.timestamp)}
              </MessageTime>
            </MessageBubble>
          );
        })}
        
        {isTyping && (
          <TypingIndicator>
            Support agent is typing...
          </TypingIndicator>
        )}
      </ChatBody>

      <ChatFooter onSubmit={handleSend}>
        <IconButton type="button">
          <Paperclip size={20} />
        </IconButton>
        
        <InputContainer>
          <ChatInput
            rows="1"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
        </InputContainer>
        
        <IconButton 
          type="submit" 
          disabled={!message.trim() || connectionStatus !== 'connected'}
        >
          <Send size={20} />
        </IconButton>
      </ChatFooter>
    </ChatWrapper>
  );
};

export default ClientChat;