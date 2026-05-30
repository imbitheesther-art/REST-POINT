import React, { useState, useRef } from "react";

const AdvancedPdfViewer = ({ pdfUrl, invoice, onClose, onDownload, onPrint }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const iframeRef = useRef(null);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
    >
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content bg-dark border-0">
          {/* Header */}
          <div className="modal-header bg-dark border-secondary py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="text-white mb-0">{invoice?.invoice_number}</h5>
              <small className="text-muted">{invoice?.deceased_name}</small>
            </div>
            <button className="btn btn-danger btn-sm" onClick={onClose}>
              Close
            </button>
          </div>

          {/* Controls */}
          <div className="modal-body d-flex flex-column align-items-center justify-content-start py-2">
            <div className="mb-3">
              <button className="btn btn-outline-light btn-sm me-2" onClick={zoomOut}>
                Zoom Out
              </button>
              <button className="btn btn-outline-light btn-sm me-2" onClick={zoomIn}>
                Zoom In
              </button>
              <button className="btn btn-outline-light btn-sm me-2" onClick={rotate}>
                Rotate
              </button>
              <button
                className="btn btn-success btn-sm me-2"
                onClick={() => onDownload && onDownload()}
              >
                Download
              </button>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => onPrint && onPrint()}
              >
                Print
              </button>
            </div>

            {/* PDF Viewer */}
            <div
              style={{
                width: "90%",
                height: "90vh",
                overflow: "auto",
                backgroundColor: "#fff",
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: "transform 0.3s ease",
              }}
            >
              <iframe
                ref={iframeRef}
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} // hides default PDF controls
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title={`PDF-${invoice?.invoice_number}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPdfViewer;
