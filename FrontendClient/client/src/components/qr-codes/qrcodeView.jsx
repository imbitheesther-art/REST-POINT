import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

// Container for the QR Code viewer
const Container = styled.div`
  max-width: 650px;
  margin: 50px auto;
  padding: 30px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  text-align: center;
  font-family: 'Arial', sans-serif;
`;

// Main Title
const Title = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding-bottom: 10px;
  border-bottom: 3px solid #2ecc71;
`;

// QR Code Image
const QRImage = styled.div`
  width: 300px;
  height: 300px;
  margin: 20px auto;
  border: 2px solid #2ecc71;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
`;

// Information Text
const Info = styled.p`
  font-size: 18px;
  color: #34495e;
  margin-top: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
  line-height: 1.6;
`;

// Error Message
const Error = styled.p`
  color: #e74c3c;
  font-weight: bold;
  font-size: 16px;
  margin-top: 20px;
`;

// Loading Text
const Loading = styled.p`
  font-style: italic;
  color: #95a5a6;
  font-size: 18px;
  margin-top: 20px;
`;

// Generate Button
const GenerateButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }
`;

const QRCodeViewer = () => {
  const [qrCode, setQRCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);
  
  const { id } = useParams(); // Get deceased ID from URL params

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);
    setShowQR(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/v1/restpoint/qr-code/${id}`);
      const data = await response.json();

      if (data.success) {
        setQRCode(data.qrCode);
      } else {
        throw new Error(data.message || 'Failed to generate QR code');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Rest Point QR Code</Title>
      
      <GenerateButton onClick={generateQRCode} disabled={loading}>
        {loading ? 'Generating...' : 'Generate QR Code'}
      </GenerateButton>

      {loading && <Loading>Generating QR Code...</Loading>}
      {error && <Error>Error: {error}</Error>}

      {showQR && (
        <>
          <QRImage>
            {qrCode ? (
              <img 
                src={qrCode} 
                alt="Deceased Details QR Code" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  padding: '10px'
                }} 
              />
            ) : (
              <div style={{ color: '#95a5a6', fontSize: '14px', padding: '20px' }}>
                {loading ? 'Generating QR Code...' : 'QR Code will appear here after generation'}
              </div>
            )}
          </QRImage>
          <Info>📷 Scan this QR code to instantly view deceased details. No internet required!</Info>
        </>
      )}
    </Container>
  );
};

export default QRCodeViewer;