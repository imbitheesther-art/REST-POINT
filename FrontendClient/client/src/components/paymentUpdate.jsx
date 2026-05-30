import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { 
  CreditCard, 
  Smartphone, 
  User, 
  CheckCircle, 
  XCircle, 
  Send,
  DollarSign,
  Building
} from 'lucide-react';

// Professional color palette
const theme = {
  primary: '#4338CA',
  primaryLight: '#6366F1',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#F59E0B',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#1E293B',
  subtle: '#64748B',
  border: '#E2E8F0',
  inputBg: '#F1F5F9',
};

// Styled components
const PaymentContainer = styled.div`
  background-color: ${theme.cardBg};
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid ${theme.border};
  color: ${theme.text};
  max-width: 600px;
  margin: 2rem auto;
`;

const PaymentTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${theme.text};
`;

const PaymentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${theme.border};
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: ${theme.inputBg};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.1);
  }
  
  &:disabled {
    background-color: ${theme.border};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid ${theme.border};
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: ${theme.inputBg};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.1);
  }
`;

const PaymentOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
`;

const PaymentOption = styled.div`
  border: 2px solid ${props => props.selected ? theme.primary : theme.border};
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.selected ? 'rgba(67, 56, 202, 0.05)' : theme.cardBg};
  
  &:hover {
    border-color: ${theme.primaryLight};
  }
`;

const OptionContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const OptionLabel = styled.span`
  font-weight: 600;
  color: ${props => props.selected ? theme.primary : theme.text};
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => props.primary && css`
    background-color: ${theme.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${theme.primaryLight};
      transform: translateY(-1px);
    }
    
    &:disabled {
      background-color: ${theme.subtle};
      cursor: not-allowed;
    }
  `}
  
  ${props => props.secondary && css`
    background-color: transparent;
    color: ${theme.text};
    border: 2px solid ${theme.border};
    
    &:hover {
      border-color: ${theme.primary};
      color: ${theme.primary};
    }
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  
  ${props => props.success && css`
    background-color: rgba(22, 163, 74, 0.1);
    color: ${theme.success};
    border: 1px solid rgba(22, 163, 74, 0.2);
  `}
  
  ${props => props.error && css`
    background-color: rgba(220, 38, 38, 0.1);
    color: ${theme.error};
    border: 1px solid rgba(220, 38, 38, 0.2);
  `}
  
  ${props => props.loading && css`
    background-color: rgba(245, 158, 11, 0.1);
    color: ${theme.warning};
    border: 1px solid rgba(245, 158, 11, 0.2);
  `}
`;

const DeceasedInfo = styled.div`
  background-color: ${theme.background};
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${theme.border};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${theme.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: ${theme.subtle};
`;

const InfoValue = styled.span`
  color: ${theme.text};
`;

const PaymentUpdate = () => {
  const { id } = useParams();
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: '',
    reference: '',
    phoneNumber: '',
    bankName: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deceasedInfo, setDeceasedInfo] = useState(null);

  // Fetch deceased information
  useEffect(() => {
    const fetchDeceasedInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/v1/restpoint/deceased/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDeceasedInfo(data);
        } else {
          setMessage({ type: 'error', text: 'Failed to fetch deceased information' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error fetching deceased information' });
      }
    };

    fetchDeceasedInfo();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5000/api/v1/restpoint/update-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deceasedId: id,
          ...paymentData
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Payment updated successfully!' });
        setPaymentData({
          amount: '',
          paymentMethod: '',
          reference: '',
          phoneNumber: '',
          bankName: '',
          transactionDate: new Date().toISOString().split('T')[0]
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update payment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSTKPush = async () => {
    if (!paymentData.amount || !paymentData.phoneNumber) {
      setMessage({ type: 'error', text: 'Please enter amount and phone number for STK push' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5000/api/v1/restpoint/initiate-stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deceasedId: id,
          amount: paymentData.amount,
          phoneNumber: paymentData.phoneNumber
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'STK push initiated successfully! Check your phone to complete payment.' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to initiate STK push' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContainer>
      <PaymentTitle>
        <DollarSign size={24} />
        Update Payment Information
      </PaymentTitle>

      {deceasedInfo && (
        <DeceasedInfo>
          <InfoRow>
            <InfoLabel>Deceased Name:</InfoLabel>
            <InfoValue>{deceasedInfo.name || 'N/A'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>ID Number:</InfoLabel>
            <InfoValue>{deceasedInfo.idNumber || 'N/A'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Mortuary Number:</InfoLabel>
            <InfoValue>{deceasedInfo.mortuaryNumber || 'N/A'}</InfoValue>
          </InfoRow>
        </DeceasedInfo>
      )}

      <PaymentForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            <DollarSign size={18} />
            Amount (Ksh)
          </Label>
          <Input
            type="number"
            name="amount"
            value={paymentData.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            required
            min="0"
          />
        </FormGroup>

        <FormGroup>
          <Label>Payment Method</Label>
          <PaymentOptions>
            <PaymentOption
              selected={paymentData.paymentMethod === 'mpesa'}
              onClick={() => handlePaymentMethodSelect('mpesa')}
            >
              <OptionContent>
                <Smartphone size={24} />
                <OptionLabel selected={paymentData.paymentMethod === 'mpesa'}>
                  MPESA
                </OptionLabel>
              </OptionContent>
            </PaymentOption>
            <PaymentOption
              selected={paymentData.paymentMethod === 'bank'}
              onClick={() => handlePaymentMethodSelect('bank')}
            >
              <OptionContent>
                <Building size={24} />
                <OptionLabel selected={paymentData.paymentMethod === 'bank'}>
                  Bank Transfer
                </OptionLabel>
              </OptionContent>
            </PaymentOption>
          </PaymentOptions>
        </FormGroup>

        {paymentData.paymentMethod === 'mpesa' && (
          <>
            <FormGroup>
              <Label>
                <Smartphone size={18} />
                Phone Number
              </Label>
              <Input
                type="tel"
                name="phoneNumber"
                value={paymentData.phoneNumber}
                onChange={handleInputChange}
                placeholder="07XX XXX XXX"
                pattern="[0-9]{10}"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>
                <CreditCard size={18} />
                MPESA Reference
              </Label>
              <Input
                type="text"
                name="reference"
                value={paymentData.reference}
                onChange={handleInputChange}
                placeholder="Enter MPESA reference number"
                required
              />
            </FormGroup>
          </>
        )}

        {paymentData.paymentMethod === 'bank' && (
          <>
            <FormGroup>
              <Label>
                <Building size={18} />
                Bank Name
              </Label>
              <Input
                type="text"
                name="bankName"
                value={paymentData.bankName}
                onChange={handleInputChange}
                placeholder="Enter bank name"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>
                <CreditCard size={18} />
                Transaction Reference
              </Label>
              <Input
                type="text"
                name="reference"
                value={paymentData.reference}
                onChange={handleInputChange}
                placeholder="Enter transaction reference"
                required
              />
            </FormGroup>
          </>
        )}

        <FormGroup>
          <Label>Transaction Date</Label>
          <Input
            type="date"
            name="transactionDate"
            value={paymentData.transactionDate}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <ButtonGroup>
          <Button 
            type="submit" 
            primary 
            disabled={loading || !paymentData.paymentMethod || !paymentData.amount}
          >
            {loading ? 'Processing...' : 'Update Payment'}
            {!loading && <CheckCircle size={18} />}
          </Button>
          
          {paymentData.paymentMethod === 'mpesa' && paymentData.amount && paymentData.phoneNumber && (
            <Button 
              type="button" 
              secondary 
              onClick={handleSTKPush}
              disabled={loading}
            >
              Send STK Push
              <Send size={18} />
            </Button>
          )}
        </ButtonGroup>

        {message.text && (
          <StatusMessage 
            success={message.type === 'success'} 
            error={message.type === 'error'}
            loading={message.type === 'loading'}
          >
            {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            {message.text}
          </StatusMessage>
        )}
      </PaymentForm>
    </PaymentContainer>
  );
};

export default PaymentUpdate;