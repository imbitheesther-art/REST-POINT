// components/InvoiceView.js
import React, { useState } from 'react';

const InvoiceView = ({ invoice, deceased, onBack, onEdit, onDownload }) => {
  const [downloading, setDownloading] = useState(false);

  if (!invoice) return null;

  const items = typeof invoice.items === 'string' ? 
    JSON.parse(invoice.items) : invoice.items;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload();
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Invoice Details - {invoice.invoice_number}</h5>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={onBack}>
              <i className="fas fa-arrow-left me-2"></i>
              Back to List
            </button>
            <button className="btn btn-primary" onClick={onEdit}>
              <i className="fas fa-edit me-2"></i>
              Edit Invoice
            </button>
            <button 
              className="btn btn-success" 
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Downloading...
                </>
              ) : (
                <>
                  <i className="fas fa-download me-2"></i>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {/* Invoice Header */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h4 className="text-primary mb-2">MORTUARY SERVICES INVOICE</h4>
            <div className="invoice-meta">
              <p className="mb-1">
                <strong>Invoice #:</strong> {invoice.invoice_number}
              </p>
              <p className="mb-1">
                <strong>Date:</strong> {new Date(invoice.created_at).toLocaleDateString()}
              </p>
              {invoice.updated_at && invoice.updated_at !== invoice.created_at && (
                <p className="mb-1">
                  <strong>Last Updated:</strong> {new Date(invoice.updated_at).toLocaleDateString()}
                </p>
              )}
              {invoice.stamp_hash && (
                <p className="mb-0">
                  <strong>Digital Stamp:</strong> 
                  <small className="text-muted ms-1">{invoice.stamp_hash}</small>
                </p>
              )}
            </div>
          </div>
          <div className="col-md-6 text-end">
            <h5 className="text-primary">{invoice.mortuary_name}</h5>
            <p className="mb-1">{invoice.mortuary_phone}</p>
            <p className="mb-0 text-muted">Professional Mortuary Services</p>
          </div>
        </div>

        <hr />

        {/* Client Information */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h6 className="text-primary mb-3">
              <i className="fas fa-user me-2"></i>
              Client Information
            </h6>
            <div className="client-details">
              <p className="mb-2">
                <strong>Deceased Name:</strong> {invoice.deceased_name}
              </p>
              <p className="mb-2">
                <strong>Next of Kin:</strong> {invoice.nok || 'N/A'}
              </p>
              <p className="mb-2">
                <strong>ID Number:</strong> {invoice.id_number || 'N/A'}
              </p>
              <p className="mb-2">
                <strong>Date of Death:</strong> {invoice.dod || 'N/A'}
              </p>
              <p className="mb-2">
                <strong>Address:</strong> {invoice.address || 'N/A'}
              </p>
              <p className="mb-0">
                <strong>Phone:</strong> {invoice.phone || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="row mb-4">
          <div className="col-12">
            <h6 className="text-primary mb-3">
              <i className="fas fa-list me-2"></i>
              Services Provided
            </h6>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th width="50%">Service Description</th>
                    <th width="15%" className="text-center">Quantity</th>
                    <th width="20%" className="text-end">Unit Price (KES)</th>
                    <th width="15%" className="text-end">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.service}</td>
                      <td className="text-center">{item.qty}</td>
                      <td className="text-end">{parseFloat(item.amount).toLocaleString()}</td>
                      <td className="text-end fw-bold">
                        {(item.qty * item.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td colSpan="3" className="text-end fw-bold">Subtotal:</td>
                    <td className="text-end fw-bold">
                      KES {parseFloat(invoice.subtotal || invoice.total_amount).toLocaleString()}
                    </td>
                  </tr>
                  {invoice.tax_amount > 0 && (
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">
                        Tax ({invoice.tax_rate}%):
                      </td>
                      <td className="text-end fw-bold">
                        KES {parseFloat(invoice.tax_amount).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="3" className="text-end fw-bold text-primary">Total Amount:</td>
                    <td className="text-end fw-bold text-success fs-5">
                      KES {parseFloat(invoice.total_amount).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        {invoice.signature_url && (
          <div className="row mt-5">
            <div className="col-md-6 offset-md-6 text-center">
              <div className="border-top pt-4">
                <p className="mb-2"><strong>Authorized Signature</strong></p>
                <img 
                  src={invoice.signature_url} 
                  alt="Signature" 
                  style={{ maxWidth: '200px', maxHeight: '80px' }}
                  className="img-fluid border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <p className="text-muted mt-2 mb-1">{invoice.mortuary_name}</p>
                <small className="text-muted">Authorized Representative</small>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Footer */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="border-top pt-3">
              <h6 className="text-primary mb-2">Terms & Conditions</h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="small text-muted mb-0">
                    <li>Payment due within 30 days of invoice date</li>
                    <li>Late payments subject to 2% monthly interest charge</li>
                    <li>All payments to be made via bank transfer or mobile money</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small">
                    <p className="mb-1">
                      <strong>Digital Stamp:</strong> {invoice.stamp_hash}
                    </p>
                    <p className="mb-1">
                      <strong>Generated:</strong> {new Date().toLocaleString()}
                    </p>
                    <p className="mb-0">
                      This is a computer-generated invoice. No physical signature required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;