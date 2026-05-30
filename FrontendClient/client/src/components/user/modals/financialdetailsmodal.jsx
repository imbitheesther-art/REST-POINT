import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  DollarSign,
  CalendarDays,
  Box,
  Receipt,
  CreditCard,
  Scale,
  Printer,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

// 🎨 Modern Color Scheme
const Colors = {
  primaryBlue: "#3B82F6",
  primaryDark: "#1E293B",
  lightGray: "#F8FAFC",
  mediumGray: "#E2E8F0",
  darkGray: "#334155",
  textMuted: "#64748B",
  successGreen: "#10B981",
  dangerRed: "#EF4444",
  warningYellow: "#F59E0B",
  infoBlue: "#0EA5E9",
  cardBg: "#FFFFFF",
  cardShadow: "0 4px 16px rgba(0,0,0,0.08)",
  borderColor: "#CBD5E1",
};

// ===============================
// Enhanced Styled Components
// ===============================
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${Colors.cardBg};
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${Colors.cardShadow};
  border: 1px solid ${Colors.borderColor};
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${Colors.mediumGray};
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-weight: 700;
  color: ${Colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  border: none;
  background: ${Colors.lightGray};
  color: ${Colors.darkGray};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${Colors.mediumGray};
    color: ${Colors.primaryDark};
  }
`;

const FinancialGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FinancialCard = styled.div`
  background: ${Colors.lightGray};
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid ${Colors.borderColor};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const CardTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${Colors.textMuted};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${Colors.primaryDark};
`;

const CardSubtitle = styled.div`
  font-size: 0.75rem;
  color: ${Colors.textMuted};
  margin-top: 0.25rem;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${Colors.mediumGray};

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  font-weight: 500;
  color: ${Colors.textMuted};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const DetailValue = styled.div`
  color: ${Colors.darkGray};
  font-weight: 600;
  font-size: 0.95rem;
`;

const BalanceStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: ${props => props.overdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  border: 1px solid ${props => props.overdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'};
  margin: 1rem 0;
`;

const StatusText = styled.div`
  color: ${props => props.overdue ? Colors.dangerRed : Colors.successGreen};
  font-weight: 600;
  font-size: 0.95rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, ${Colors.primaryBlue} 0%, #2563eb 100%);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  background: ${Colors.lightGray};
  border: 1px solid ${Colors.mediumGray};
  border-radius: 0.75rem;
  color: ${Colors.darkGray};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${Colors.mediumGray};
    transform: translateY(-2px);
  }
`;

const SummarySection = styled.div`
  background: linear-gradient(135deg, ${Colors.primaryDark} 0%, #2c3e50 100%);
  border-radius: 0.75rem;
  padding: 1.5rem;
  color: white;
  margin: 1.5rem 0;
`;

const SummaryTitle = styled.h4`
  color: white;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
`;

const SummaryLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.25rem;
`;

// ===============================
// MAIN COMPONENT
// ===============================
const FinancialDetailsModal = ({ isOpen, onClose, deceasedData }) => {
  const [financialData, setFinancialData] = useState({
    totalCharges: 0,
    daysSpent: 0,
    coldRoomCharges: 0,
    otherCharges: 0,
    payments: 0,
    balance: 0,
    currency: "KES"
  });

  useEffect(() => {
    if (isOpen && deceasedData) {
      const financialDetails = deceasedData.financial_details || {};
      setFinancialData({
        totalCharges: financialDetails.total_charges || 0,
        daysSpent: financialDetails.days_spent || 0,
        coldRoomCharges: financialDetails.cold_room_charges || 0,
        otherCharges: financialDetails.other_charges || 0,
        payments: financialDetails.total_payments || 0,
        balance: financialDetails.balance || 0,
        currency: financialDetails.currency || "KES"
      });
    }
  }, [isOpen, deceasedData]);

  const isBalanceOverdue = financialData.balance > 0;
  const paymentPercentage = financialData.totalCharges > 0 
    ? (financialData.payments / financialData.totalCharges) * 100 
    : 0;

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <DollarSign size={28} />
            Financial Overview
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        {/* Summary Cards */}
        <FinancialGrid>
          <FinancialCard>
            <CardTitle>
              <TrendingUp size={16} />
              TOTAL CHARGES
            </CardTitle>
            <CardValue>
              {financialData.currency} {financialData.totalCharges.toLocaleString()}
            </CardValue>
            <CardSubtitle>All accumulated charges</CardSubtitle>
          </FinancialCard>

          <FinancialCard>
            <CardTitle>
              <CreditCard size={16} />
              PAYMENTS MADE
            </CardTitle>
            <CardValue>
              {financialData.currency} {financialData.payments.toLocaleString()}
            </CardValue>
            <CardSubtitle>
              {paymentPercentage.toFixed(1)}% of total
            </CardSubtitle>
          </FinancialCard>
        </FinancialGrid>

        {/* Balance Status */}
        <BalanceStatus overdue={isBalanceOverdue}>
          {isBalanceOverdue ? (
            <AlertTriangle size={20} color={Colors.dangerRed} />
          ) : (
            <CheckCircle size={20} color={Colors.successGreen} />
          )}
          <StatusText overdue={isBalanceOverdue}>
            {isBalanceOverdue ? 'OUTSTANDING BALANCE' : 'FULLY PAID'}
          </StatusText>
          <div style={{ marginLeft: 'auto', fontWeight: '700' }}>
            {financialData.currency} {Math.abs(financialData.balance).toLocaleString()}
          </div>
        </BalanceStatus>

        {/* Detailed Breakdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: Colors.primaryDark, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Charge Breakdown
          </h4>
          
          <DetailItem>
            <DetailLabel>
              <CalendarDays size={16} />
              Days in Mortuary
            </DetailLabel>
            <DetailValue>{financialData.daysSpent} days</DetailValue>
          </DetailItem>

          <DetailItem>
            <DetailLabel>
              <Box size={16} />
              Cold Room Charges
            </DetailLabel>
            <DetailValue>
              {financialData.currency} {financialData.coldRoomCharges.toLocaleString()}
            </DetailValue>
          </DetailItem>

          <DetailItem>
            <DetailLabel>
              <Receipt size={16} />
              Other Charges
            </DetailLabel>
            <DetailValue>
              {financialData.currency} {financialData.otherCharges.toLocaleString()}
            </DetailValue>
          </DetailItem>
        </div>

        {/* Financial Summary */}
        <SummarySection>
          <SummaryTitle>
            <Scale size={20} />
            Financial Summary
          </SummaryTitle>
          <SummaryGrid>
            <SummaryItem>
              <SummaryValue>
                {financialData.currency} {financialData.totalCharges.toLocaleString()}
              </SummaryValue>
              <SummaryLabel>Total Charges</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue>
                {financialData.currency} {financialData.payments.toLocaleString()}
              </SummaryValue>
              <SummaryLabel>Paid Amount</SummaryLabel>
            </SummaryItem>
          </SummaryGrid>
        </SummarySection>

        {/* Action Buttons */}
        <ActionButtons>
          <PrimaryButton onClick={() => window.print()}>
            <Printer size={18} />
            Print Invoice
          </PrimaryButton>
          <SecondaryButton onClick={onClose}>
            Close Overview
          </SecondaryButton>
        </ActionButtons>

        {/* Additional Info */}
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: Colors.lightGray, 
          borderRadius: '0.5rem',
          fontSize: '0.8rem',
          color: Colors.textMuted,
          textAlign: 'center'
        }}>
          <strong>Note:</strong> Financial data is updated in real-time. Last updated: {new Date().toLocaleDateString()}
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FinancialDetailsModal;