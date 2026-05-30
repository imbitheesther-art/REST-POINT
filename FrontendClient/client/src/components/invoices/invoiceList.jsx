// components/InvoiceList.js
import React from 'react';

const InvoiceList = ({ 
  invoices, 
  selectedDeceased, 
  loading, 
  onEdit, 
  onView, 
  onDelete, 
  onDownload, 
  onCreateNew,
  onBackToDeceased 
}) => {
  if (loading) {
    return (
      <div className="card shadow">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">
              Invoices for {selectedDeceased?.name}
            </h5>
            {selectedDeceased && (
              <small className="text-muted">
                ID: {selectedDeceased.id_number} | Next of Kin: {selectedDeceased.nok}
              </small>
            )}
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={onBackToDeceased}>
              <i className="fas fa-arrow-left me-1"></i>
              Change Deceased
            </button>
            <button className="btn btn-primary btn-sm" onClick={onCreateNew}>
              <i className="fas fa-plus me-1"></i>
              New Invoice
            </button>
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        {invoices.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-file-invoice fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No Invoices Found</h5>
            <p className="text-muted">No invoices have been created for this deceased yet.</p>
            <button className="btn btn-primary" onClick={onCreateNew}>
              <i className="fas fa-plus me-2"></i>
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Invoice #</th>
                  <th>Deceased Name</th>
                  <th>Next of Kin</th>
                  <th>Total Amount</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong className="text-primary">{invoice.invoice_number}</strong>
                    </td>
                    <td>{invoice.deceased_name}</td>
                    <td>{invoice.nok || 'N/A'}</td>
                    <td>
                      <span className="fw-bold text-success">
                        KES {parseFloat(invoice.total_amount).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge bg-success">Active</span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => onView(invoice)}
                          title="View Invoice"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => onEdit(invoice)}
                          title="Edit Invoice"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-outline-success"
                          onClick={() => onDownload(invoice.id)}
                          title="Download PDF"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => onDelete(invoice.id)}
                          title="Delete Invoice"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;