import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
    Box, CheckSquare, PlusSquare, Loader2, 
    Eye, X, ChevronLeft, ChevronRight,
    Calendar, User, Package, Tag, Trash2
} from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CoffinSelectionModal from './coffinselectModal';

// Clean, professional colors
const Colors = {
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#059669',
    successLight: '#ECFDF5',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    background: '#F9FAFB'
};

// Compact styled components
const Card = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid ${Colors.border};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid ${Colors.border};
`;

const CardTitle = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: ${Colors.textPrimary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
`;

const StatusBadge = styled.div`
    background: ${Colors.successLight};
    color: ${Colors.success};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const CoffinCard = styled.div`
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 1rem;
    padding: 1rem;
    background: ${Colors.primaryLight};
    border: 1px solid ${Colors.border};
    border-radius: 6px;
    margin-bottom: 1rem;
`;

const CoffinImage = styled.img`
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid ${Colors.border};
    cursor: pointer;
    
    &:hover {
        opacity: 0.9;
    }
`;

const CoffinDetails = styled.div`
    .coffin-type {
        font-weight: 600;
        color: ${Colors.textPrimary};
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }
    
    .coffin-specs {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        font-size: 0.875rem;
    }
    
    .spec-item {
        color: ${Colors.textSecondary};
        
        strong {
            color: ${Colors.textPrimary};
        }
    }
    
    .coffin-price {
        font-weight: 600;
        color: ${Colors.success};
        margin-top: 0.5rem;
        font-size: 0.875rem;
    }
`;

const AssignmentInfo = styled.div`
    text-align: right;
    font-size: 0.875rem;
    
    .assignment-item {
        margin-bottom: 0.25rem;
        color: ${Colors.textSecondary};
        
        strong {
            color: ${Colors.textPrimary};
        }
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid ${Colors.border};
    background: white;
    color: ${Colors.textPrimary};
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background: ${Colors.background};
    }
    
    &.primary {
        background: ${Colors.primary};
        color: white;
        border-color: ${Colors.primary};
        
        &:hover {
            background: #1D4ED8;
        }
    }
    
    &.danger {
        background: #FEF2F2;
        color: #DC2626;
        border-color: #FECACA;
        
        &:hover {
            background: #FEE2E2;
        }
    }
`;

const NoAssignment = styled.div`
    text-align: center;
    padding: 2rem;
    color: ${Colors.textSecondary};
    
    p {
        margin: 0.5rem 0;
    }
`;

const Loader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: ${Colors.primary};
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Image Modal
const ImageModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
`;

const ModalContent = styled.div`
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
`;

const ModalImage = styled.img`
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 4px;
`;

const CloseButton = styled.button`
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.5rem;
`;

const Navigation = styled.div`
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1rem;
    color: white;
`;

const NavButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const CoffinAssignment = () => {
    const { id } = useParams();
    const [deceasedData, setDeceasedData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    
    // Image modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

    const fetchDeceasedData = async () => {
        setIsLoading(true);
        try {
            console.log('🔄 Fetching deceased data for coffin assignment...');
            const response = await axios.get(`${API_BASE_URL}/deceased-id`, {
                params: { id: id },
                timeout: 10000
            });
            
            console.log('📦 Coffin assignment API response:', response.data);
            
            if (response.data?.data) {
                const data = response.data.data;
                setDeceasedData(data);
                
                // Debug: Check what coffin data we have
                console.log('🔍 Coffin data check:', {
                    rawData: data,
                    coffinData: data.coffin_assignment,
                    hasCoffinData: !!data.coffin_assignment,
                    coffinDataStructure: data.coffin_assignment ? Object.keys(data.coffin_assignment) : 'No data'
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveAssignment = async () => {
        // Check for coffin assignment in deceased data
        const coffinAssignment = deceasedData?.coffin_assignment;
        
        if (!coffinAssignment || !coffinAssignment.coffin_id) {
            toast.error('No coffin assignment found to remove');
            return;
        }
        
        setIsRemoving(true);
        try {
            await axios.delete(`${API_BASE_URL}/deceased/${id}/coffin`, {
                timeout: 10000
            });
            
            toast.success('Coffin assignment removed');
            await fetchDeceasedData();
        } catch (error) {
            console.error("Remove error:", error);
            toast.error('Failed to remove assignment');
        } finally {
            setIsRemoving(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDeceasedData();
        }
    }, [id]);

    const handleCoffinAssigned = () => {
        fetchDeceasedData();
        setIsModalOpen(false);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath || typeof imagePath !== 'string') {
            console.warn('Invalid image path:', imagePath);
            return null;
        }
        
        try {
            // Clean up the path
            let cleanPath = imagePath.trim();
            
            // If it's already a full URL, return it
            if (cleanPath.startsWith('http')) {
                return cleanPath;
            }
            
            // Remove any double slashes
            cleanPath = cleanPath.replace(/\/\//g, '/');
            
            // Ensure it starts with a slash if it's a relative path
            if (!cleanPath.startsWith('/')) {
                cleanPath = '/' + cleanPath;
            }
            
            // Return the full URL
            return `http://localhost:5000${cleanPath}`;
        } catch (error) {
            console.error('Error processing image URL:', error);
            return null;
        }
    };

    // Image modal functions
    const openImageModal = (index = 0) => {
        setCurrentImageIndex(index);
        setImageModalOpen(true);
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
    };

    const nextImage = () => {
        const images = getCoffinImages();
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const getCoffinImages = () => {
        const coffinAssignment = deceasedData?.coffin_assignment;
        if (!coffinAssignment) {
            return [];
        }
        
        const images = [];
        
        // Check for primary image
        if (coffinAssignment.primary_image) {
            const url = getImageUrl(coffinAssignment.primary_image);
            if (url) images.push(url);
        }
        
        // Check for additional images
        if (coffinAssignment.images && Array.isArray(coffinAssignment.images)) {
            coffinAssignment.images.forEach(img => {
                const url = getImageUrl(img);
                if (url) images.push(url);
            });
        }
        
        // If no images found but we have a coffin, add a placeholder
        if (images.length === 0 && coffinAssignment.coffin_id) {
            images.push('/api/placeholder/80/80');
        }
        
        return images;
    };

    // Safe getter for coffin data
    const getCoffinData = () => {
        if (!deceasedData?.coffin_assignment) {
            return null;
        }
        
        const coffin = deceasedData.coffin_assignment;
        
        // Return safe defaults for all fields
        return {
            type: coffin.type || 'Standard Coffin',
            material: coffin.material || 'Wood',
            size: coffin.size || 'Standard',
            color: coffin.color || 'Brown',
            supplier: coffin.supplier || 'Unknown',
            price: coffin.price || 0,
            assignment_date: coffin.assignment_date || new Date().toISOString().split('T')[0],
            primary_image: coffin.primary_image || null,
            coffin_id: coffin.coffin_id || null,
            images: coffin.images || []
        };
    };

    const coffinData = getCoffinData();
    const hasCoffinAssignment = !!coffinData?.coffin_id;
    const coffinImages = getCoffinImages();

    console.log('🎯 Current coffin assignment state:', {
        hasCoffinAssignment,
        coffinData,
        coffinImages: coffinImages.length,
        deceasedName: deceasedData?.full_name || 'Unknown'
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle><Box size={18} /> Coffin Assignment</CardTitle>
                </CardHeader>
                <Loader>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ marginLeft: '0.5rem' }}>Loading...</span>
                </Loader>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle><Box size={18} /> Coffin Assignment</CardTitle>
                    {hasCoffinAssignment && (
                        <StatusBadge>
                            <CheckSquare size={12} />
                            Assigned
                        </StatusBadge>
                    )}
                </CardHeader>

                {hasCoffinAssignment ? (
                    <>
                        <CoffinCard>
                            <div>
                                {coffinImages.length > 0 && (
                                    <CoffinImage 
                                        src={coffinImages[0]} 
                                        alt={coffinData.type}
                                        onClick={() => openImageModal(0)}
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMSIvPgo8cGF0aCBkPSJNNTIuNSA0MGMwIDYuOS01LjYgMTIuNS0xMi41IDEyLjVTMjcuNSA0Ni45IDI3NSA0MCAyNy41IDI3LjEgMzIuNSAyMC41IDUyLjUgMzMuMSA1Mi41IDQweiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjI4IiByPSI2IiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0zMC40IDQ5LjZDNDEuMyA1OC44IDU0LjUgNTEuMSA1NC41IDQwSDI1LjVDMjUuNSA1MS4xIDM4LjcgNTguOCA0OS42IDQ5LjZaIiBmaWxsPSIjRTVFN0VCIi8+Cjwvc3ZnPgo=';
                                        }}
                                    />
                                )}
                            </div>
                            
                            <CoffinDetails>
                                <div className="coffin-type">
                                    {coffinData.type}
                                </div>
                                <div className="coffin-specs">
                                    <div className="spec-item">
                                        <strong>Material:</strong> {coffinData.material}
                                    </div>
                                    <div className="spec-item">
                                        <strong>Size:</strong> {coffinData.size}
                                    </div>
                                    <div className="spec-item">
                                        <strong>Color:</strong> {coffinData.color}
                                    </div>
                                    <div className="spec-item">
                                        <strong>Supplier:</strong> {coffinData.supplier}
                                    </div>
                                </div>
                                <div className="coffin-price">
                                    Ksh {parseInt(coffinData.price || 0).toLocaleString()}
                                </div>
                            </CoffinDetails>
                            
                            <AssignmentInfo>
                                <div className="assignment-item">
                                    <strong>Assigned:</strong><br />
                                    {coffinData.assignment_date}
                                </div>
                                <div className="assignment-item">
                                    <strong>To:</strong><br />
                                    {deceasedData?.full_name || 'N/A'}
                                </div>
                            </AssignmentInfo>
                        </CoffinCard>
                        
                        <ButtonGroup>
                            <Button 
                                className="primary"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <PlusSquare size={14} />
                                Change
                            </Button>
                            <Button 
                                className="danger"
                                onClick={handleRemoveAssignment}
                                disabled={isRemoving}
                            >
                                <Trash2 size={14} />
                                {isRemoving ? 'Removing...' : 'Remove'}
                            </Button>
                            {coffinImages.length > 0 && (
                                <Button onClick={() => openImageModal(0)}>
                                    <Eye size={14} />
                                    View Images
                                </Button>
                            )}
                        </ButtonGroup>
                    </>
                ) : (
                    <NoAssignment>
                        <p>No coffin assigned</p>
                        <p style={{ fontSize: '0.875rem', color: Colors.textSecondary }}>
                            Deceased: {deceasedData?.full_name || 'Unknown'}
                        </p>
                        <Button 
                            className="primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <PlusSquare size={14} />
                            Assign Coffin
                        </Button>
                    </NoAssignment>
                )}
            </Card>

            {/* Coffin Selection Modal */}
            {isModalOpen && (
                <CoffinSelectionModal 
                    onClose={() => setIsModalOpen(false)}
                    onSelectCoffin={handleCoffinAssigned}
                    deceasedId={id}
                    deceasedData={deceasedData}
                />
            )}

            {/* Image Modal */}
            {imageModalOpen && coffinImages.length > 0 && (
                <ImageModal onClick={closeImageModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseButton onClick={closeImageModal}>
                            <X size={20} />
                        </CloseButton>
                        <ModalImage 
                            src={coffinImages[currentImageIndex]} 
                            alt={`Coffin image ${currentImageIndex + 1}`}
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMzAwIDIwMGMwIDU1LjItNDQuOCAxMDAtMTAwIDEwMFMxMDAgMjU1LjIgMTAwIDIwMCAxNDQuOCAxMDAgMjAwIDEwMCAzMDAgMTQ0LjggMzAwIDIwMHoiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSIyMCIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNMjAwIDI1MEMyNzAgMjUwIDMyNSAxOTUgMzI1IDEyNUgyNTBDMjUwIDE5NSAxOTUgMjUwIDEyNSAyNTBaIiBmaWxsPSIjRTVFN0VCIi8+Cjwvc3ZnPgo=';
                            }}
                        />
                        {coffinImages.length > 1 && (
                            <Navigation>
                                <NavButton onClick={prevImage} disabled={currentImageIndex === 0}>
                                    <ChevronLeft size={16} />
                                </NavButton>
                                <span>{currentImageIndex + 1} / {coffinImages.length}</span>
                                <NavButton onClick={nextImage} disabled={currentImageIndex === coffinImages.length - 1}>
                                    <ChevronRight size={16} />
                                </NavButton>
                            </Navigation>
                        )}
                    </ModalContent>
                </ImageModal>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default CoffinAssignment;