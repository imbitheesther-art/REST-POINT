import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  Upload, FileText, X, Loader2, 
  FileDigit, FolderOpen, FileUp, CheckCircle, Trash2,
  Eye, Folder
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Styled Components - Sleeker Design
const Card = styled.div`
  background: #FFFFFF;
  border-radius: 10px;
  padding: 0.8rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #EAECF0;
  max-width: 100%;
  margin: 0 auto;
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1A1A1A;
`;

const Badge = styled.span`
  background: ${props => props.highlight ? '#3B82F6' : '#F3F4F6'};
  color: ${props => props.highlight ? 'white' : '#6B7280'};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const FileDropzone = styled.div`
  border: 1.5px dashed ${props => props.active ? '#3B82F6' : '#D1D5DB'};
  border-radius: 8px;
  padding: 2rem 1.5rem;
  text-align: center;
  background: ${props => props.active ? '#F8FAFF' : '#FAFBFC'};
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  cursor: pointer;

  &:hover {
    border-color: #3B82F6;
    background: #F8FAFF;
  }
`;

const DropzoneContent = styled.div`
  color: #6B7280;
  font-size: 0.875rem;
  
  svg {
    margin-bottom: 0.75rem;
    color: #9CA3AF;
  }
`;

const FileList = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background: #F3F4F6;
    border-color: #D1D5DB;
  }
`;

const FileIcon = styled.div`
  background: #EFF6FF;
  border-radius: 6px;
  padding: 0.5rem;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.125rem;
  word-break: break-word;
`;

const FileDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6B7280;
`;

const FileType = styled.span`
  background: #EDE9FE;
  color: #7C3AED;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
`;

const FileSize = styled.span`
  font-weight: 400;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #EF4444;
    background: #FEF2F2;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const PrimaryButton = styled.button`
  flex: 2;
  padding: 0.875rem 1rem;
  background: ${props => props.disabled ? '#E5E7EB' : '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #2563EB;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 0.875rem 1rem;
  background: transparent;
  color: #6B7280;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #F9FAFB;
    border-color: #D1D5DB;
    color: #374151;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ProgressBar = styled.div`
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  margin: 0.75rem 0;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: #10B981;
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const StatusMessage = styled.div`
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => props.type === 'success' && `
    background: #D1FAE5;
    color: #065F46;
    border: 1px solid #A7F3D0;
  `}
  
  ${props => props.type === 'error' && `
    background: #FEE2E2;
    color: #991B1B;
    border: 1px solid #FECACA;
  `}
  
  ${props => props.type === 'info' && `
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
  `}
`;

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid #E5E7EB;
  color: #6B7280;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;

  &:hover {
    background: #F3F4F6;
    color: #374151;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #E5E7EB;
  margin: 1rem 0;
`;

const DocumentSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
  color: #4B5563;
  
  svg {
    color: #3B82F6;
  }
`;

const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

const DocumentUpload = ({ deceasedId, onUploadSuccess, deceasedData }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Update document count from deceased data
  useEffect(() => {
    if (deceasedData) {
      const count = deceasedData.documents?.length || deceasedData.data?.documents?.length || 0;
      setDocumentCount(count);
    }
  }, [deceasedData]);

  // Detect file type
  const getFileType = (file) => {
    if (file.type.includes('pdf')) return 'PDF';
    if (file.type.includes('image')) return 'Image';
    if (file.type.includes('word')) return 'Word';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'Excel';
    if (file.type.includes('text')) return 'Text';
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) return 'Archive';
    return 'Document';
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (!selectedFiles.length) return;

    // Validate files
    const validFiles = selectedFiles.filter(file => {
      const maxSize = 20 * 1024 * 1024; // 20MB
      
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 20MB limit`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      const filesWithType = validFiles.map(file => ({
        file,
        type: getFileType(file),
        size: file.size
      }));
      
      setFiles(prev => [...prev, ...filesWithType]);
      toast.success(`Added ${validFiles.length} file(s)`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!deceasedId) {
      toast.error('No deceased selected');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(({ file }) => {
        formData.append('files', file);
      });
      formData.append('deceased_id', deceasedId);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch(`${API_BASE_URL}/deceased/${deceasedId}/documents`, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (response.ok) {
        setUploadProgress(100);
        const result = await response.json();
        setUploadStatus('success');
        
        // Update document count
        const newCount = result.files?.length || files.length;
        setDocumentCount(prev => prev + newCount);
        
        toast.success(`Successfully uploaded ${files.length} file(s)`);
        
        // Clear files after success
        setTimeout(() => {
          setFiles([]);
          setUploadStatus(null);
          setUploadProgress(0);
          
          if (onUploadSuccess) {
            onUploadSuccess(result);
          }
        }, 2000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle View Documents
  const handleViewDocuments = () => {
    if (!deceasedId) {
      toast.error('No deceased selected');
      return;
    }
    navigate(`/documents/${deceasedId}`);
  };

  // Remove single file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText size={18} color="#EF4444" />;
      case 'image':
        return <FileText size={18} color="#10B981" />;
      case 'word':
        return <FileText size={18} color="#3B82F6" />;
      case 'excel':
        return <FileText size={18} color="#10B981" />;
      default:
        return <FileText size={18} color="#6B7280" />;
    }
  };

  // Get total size of all files
  const getTotalSize = () => {
    return files.reduce((total, { size }) => total + size, 0);
  };

  return (
    <Card>
      <CardTitle>
        <Upload size={18} />
        Document Management
        <Badge highlight={documentCount > 0}>
          <FileDigit size={14} />
          {documentCount} doc{documentCount !== 1 ? 's' : ''}
        </Badge>
      </CardTitle>

      {/* Document Summary */}
      {deceasedData && (
        <DocumentSummary>
          <Folder size={18} />
          <div>
            <span style={{ fontWeight: 500 }}>
              {deceasedData.full_name || deceasedData.data?.full_name || 'Deceased'}
            </span>
            <span style={{ marginLeft: '0.5rem', color: '#9CA3AF' }}>
              • {documentCount} uploaded file{documentCount !== 1 ? 's' : ''}
            </span>
          </div>
        </DocumentSummary>
      )}

      {/* Dropzone */}
      <FileDropzone 
        active={files.length > 0}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <DropzoneContent>
          <Upload size={24} />
          <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
            {files.length === 0 ? 'Select files' : `${files.length} file${files.length !== 1 ? 's' : ''} selected`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            {files.length === 0 
              ? 'Click or drag files here (PDF, Images, Docs, Excel)' 
              : `${formatFileSize(getTotalSize())} total • Max 20MB per file`
            }
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
            style={{ display: 'none' }}
          />
        </DropzoneContent>
      </FileDropzone>

      {/* File List */}
      {files.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
              Selected files ({files.length})
            </div>
            {files.length > 0 && (
              <ClearButton onClick={clearFiles} disabled={isUploading}>
                <Trash2 size={14} />
                Clear All
              </ClearButton>
            )}
          </div>
          
          <FileList>
            {files.map(({ file, type, size }, index) => (
              <FileItem key={index}>
                <FileIcon>
                  {getFileIcon(type)}
                </FileIcon>
                <FileInfo>
                  <FileName>{file.name}</FileName>
                  <FileDetails>
                    <FileType>{type}</FileType>
                    <FileSize>{formatFileSize(size)}</FileSize>
                  </FileDetails>
                </FileInfo>
                <RemoveButton 
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  title="Remove file"
                >
                  <X size={16} />
                </RemoveButton>
              </FileItem>
            ))}
          </FileList>

          <Divider />
        </>
      )}

      {/* Status Messages */}
      {uploadStatus === 'uploading' && (
        <StatusMessage type="info">
          <Loader2 size={16} className="spinner" />
          Uploading {files.length} file{files.length !== 1 ? 's' : ''}...
        </StatusMessage>
      )}

      {uploadStatus === 'success' && (
        <StatusMessage type="success">
          <CheckCircle size={16} />
          Upload completed successfully!
        </StatusMessage>
      )}

      {uploadStatus === 'error' && (
        <StatusMessage type="error">
          <X size={16} />
          Upload failed. Please try again.
        </StatusMessage>
      )}

      {/* Progress Bar */}
      {uploadStatus === 'uploading' && (
        <ProgressBar>
          <Progress progress={uploadProgress} />
        </ProgressBar>
      )}

      {/* Button Group */}
      <ButtonGroup>
        <PrimaryButton
          onClick={handleUpload}
          disabled={isUploading || files.length === 0 || !deceasedId}
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="spinner" />
              Uploading...
            </>
          ) : (
            <>
              <FileUp size={16} />
              Upload Documents
            </>
          )}
        </PrimaryButton>

        <SecondaryButton
          onClick={handleViewDocuments}
          disabled={!deceasedId}
        >
          <Eye size={16} />
          View Documents
        </SecondaryButton>
      </ButtonGroup>
    </Card>
  );
};

export default DocumentUpload;