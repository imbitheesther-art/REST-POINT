// components/BurialTypeSelection.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { Church, Fire, Edit, Save, X } from 'lucide-react';
import apiService from '../services/apiService';

const Card = styled.div`
  background-color: #FFFFFF;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  border: 1px solid #CBD5E1;
  color: #334155;
`;

const CardTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1E293B;

  svg {
    stroke-width: 2.5;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: #F8FAFC;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #3B82F6 0%, #2563eb 100%);
  color: white;
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

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: #64748B;
    cursor: not-allowed;
  }
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: white;
  background-color: ${props => props.$bgColor};
  box-shadow: 0 2px 8px ${props => props.$bgColor}50;

  svg {
    stroke-width: 2.5;
  }
`;

const BurialTypeSelection = ({ deceasedId, currentType, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [burialType, setBurialType] = useState(currentType || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await apiService.updateDeceasedDetails(deceasedId, { burial_type: burialType });
      toast.success('Burial type updated successfully');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setBurialType(currentType || '');
    setIsEditing(false);
  };

  return (
    <Card>
      <CardTitle>
        {burialType === 'cremation' ? <Fire size={20} /> : <Church size={20} />}
        Burial Type
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Edit size={16} />
          </button>
        )}
      </CardTitle>
      
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            value={burialType}
            onChange={(e) => setBurialType(e.target.value)}
          >
            <option value="">Select burial type</option>
            <option value="traditional_burial">Traditional Burial</option>
            <option value="cremation">Cremation</option>
            <option value="mausoleum">Mausoleum</option>
            <option value="green_burial">Green Burial</option>
          </Select>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <SubmitButton onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save'}
              {!isUpdating && <Save size={16} />}
            </SubmitButton>
            <button 
              onClick={handleCancel}
              style={{ 
                padding: '1rem 1.5rem', 
                background: '#E2E8F0', 
                color: '#334155',
                border: 'none', 
                borderRadius: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {burialType ? (
            <>
              <Badge $bgColor={burialType === 'cremation' ? '#F59E0B' : '#0EA5E9'}>
                {burialType === 'cremation' ? <Fire size={16} /> : <Church size={16} />}
                {burialType.replace('_', ' ').toUpperCase()}
              </Badge>
            </>
          ) : (
            <span style={{ color: '#64748B' }}>Not specified</span>
          )}
        </div>
      )}
    </Card>
  );
};

export default BurialTypeSelection;