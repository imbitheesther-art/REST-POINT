import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X, Printer, Download, RefreshCw, CheckCircle } from 'lucide-react';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: #334155;
  }
`;

const PreviewSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const PreviewTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const PreviewItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PreviewLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
`;

const PreviewValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
`;

const ZPLPreview = styled.div`
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: #3b82f6;
  color: white;
  
  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(Button)`
  background: #e2e8f0;
  color: #334155;
  
  &:hover:not(:disabled) {
    background: #cbd5e1;
  }
`;

const SuccessButton = styled(Button)`
  background: #10b981;
  color: white;
  
  &:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
  }
`;

const LoadingSpinner = styled(RefreshCw)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #dcfce7;
  color: #166534;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const BodyTagModal = ({ isOpen, onClose, deceasedId, deceasedName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tagData, setTagData] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

  const generateTag = async () => {
    if (!deceasedId) {
      toast.error('No deceased ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/print-tag/${deceasedId}`);
      
      if (response.data) {
        setTagData(response.data);
        toast.success(response.data.message || 'Tag generated successfully');
      }
    } catch (err) {
      console.error('Error generating tag:', err);
      const errorMessage = err.response?.data?.message || 'Failed to generate tag';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (!tagData?.zpl_code) {
      toast.error('No ZPL code available for printing');
      return;
    }

    // For ZPL printing, you would typically send to a Zebra printer
    // This is a simplified version - you might need to integrate with your printing system
    toast.info('Sending to printer...');
    
    // Example: Open print dialog with ZPL content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Tag - ${tagData.preview.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              background: #f5f5f5;
            }
            .tag-preview {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 400px;
              margin: 0 auto;
            }
            .tag-header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .tag-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 4px 0;
            }
            .tag-label {
              font-weight: bold;
              color: #666;
            }
            .tag-value {
              color: #333;
            }
            .barcode-section {
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              border-top: 1px dashed #ccc;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 15px;
            }
            @media print {
              body { background: white; }
              .tag-preview { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="tag-preview">
            <div class="tag-header">
              <h2>Monalisa Funeral Home</h2>
              <div>---------------------------</div>
            </div>
            
            <div class="tag-row">
              <span class="tag-label">Name:</span>
              <span class="tag-value">${tagData.preview.name}</span>
            </div>
            
            <div class="tag-row">
              <span class="tag-label">Gender:</span>
              <span class="tag-value">${tagData.preview.gender}</span>
            </div>
            
            <div class="tag-row">
              <span class="tag-label">Tag ID:</span>
              <span class="tag-value">${tagData.preview.tagId}</span>
            </div>
            
            <div class="tag-row">
              <span class="tag-label">Date of Death:</span>
              <span class="tag-value">${tagData.preview.dateOfDeath}</span>
            </div>
            
            <div class="tag-row">
              <span class="tag-label">Printed:</span>
              <span class="tag-value">${tagData.preview.printedAt}</span>
            </div>
            
            <div class="barcode-section">
              <div style="margin-bottom: 10px;">[QR Code: ${tagData.preview.tagId}]</div>
              <div>Handle with Care - Morgue Tag</div>
              <div>(Cold Resistant Synthetic Tag)</div>
            </div>
            
            <div class="footer">
              Deceased ID: ${tagData.preview.deceasedId}
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
  };

  const downloadZPL = () => {
    if (!tagData?.zpl_code) {
      toast.error('No ZPL code available for download');
      return;
    }

    const blob = new Blob([tagData.zpl_code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tag-${tagData.preview.tagId}.zpl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('ZPL file downloaded');
  };

  const handleClose = () => {
    setTagData(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            🏷️ Generate Body Tag
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        {deceasedName && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '0.375rem' }}>
            <strong>Deceased:</strong> {deceasedName}
          </div>
        )}

        {tagData?.message && (
          <SuccessMessage>
            <CheckCircle size={16} />
            {tagData.message}
          </SuccessMessage>
        )}

        {error && (
          <div style={{ 
            background: '#fef2f2', 
            color: '#dc2626', 
            padding: '0.75rem', 
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {tagData?.preview && (
          <>
            <PreviewSection>
              <PreviewTitle>
                📋 Tag Preview
              </PreviewTitle>
              <PreviewGrid>
                <PreviewItem>
                  <PreviewLabel>Name</PreviewLabel>
                  <PreviewValue>{tagData.preview.name}</PreviewValue>
                </PreviewItem>
                <PreviewItem>
                  <PreviewLabel>Gender</PreviewLabel>
                  <PreviewValue>{tagData.preview.gender}</PreviewValue>
                </PreviewItem>
                <PreviewItem>
                  <PreviewLabel>Tag ID</PreviewLabel>
                  <PreviewValue>{tagData.preview.tagId}</PreviewValue>
                </PreviewItem>
                <PreviewItem>
                  <PreviewLabel>Deceased ID</PreviewLabel>
                  <PreviewValue>{tagData.preview.deceasedId}</PreviewValue>
                </PreviewItem>
                <PreviewItem>
                  <PreviewLabel>Date of Death</PreviewLabel>
                  <PreviewValue>{tagData.preview.dateOfDeath}</PreviewValue>
                </PreviewItem>
                <PreviewItem>
                  <PreviewLabel>Printed At</PreviewLabel>
                  <PreviewValue>{tagData.preview.printedAt}</PreviewValue>
                </PreviewItem>
              </PreviewGrid>
            </PreviewSection>

            <PreviewTitle>
              📄 ZPL Code
            </PreviewTitle>
            <ZPLPreview>
              {tagData.zpl_code}
            </ZPLPreview>
          </>
        )}

        <ActionButtons>
          {!tagData ? (
            <PrimaryButton 
              onClick={generateTag} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size={16} />
                  Generating...
                </>
              ) : (
                <>
                  🏷️ Generate Tag
                </>
              )}
            </PrimaryButton>
          ) : (
            <>
              <SecondaryButton onClick={generateTag}>
                <RefreshCw size={16} />
                Regenerate
              </SecondaryButton>
              <SecondaryButton onClick={downloadZPL}>
                <Download size={16} />
                Download ZPL
              </SecondaryButton>
              <SuccessButton onClick={handlePrint}>
                <Printer size={16} />
                Print Tag
              </SuccessButton>
            </>
          )}
          
          <SecondaryButton onClick={handleClose}>
            Close
          </SecondaryButton>
        </ActionButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default BodyTagModal;