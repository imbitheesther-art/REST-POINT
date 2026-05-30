// components/DeceasedSelector.jsx
import React, { useState } from 'react';

const DeceasedSelector = ({ deceasedList, loading, onSelectDeceased }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeceased = deceasedList.filter(deceased =>
    deceased.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deceased.deceased_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deceased.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deceased.cause_of_death?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deceased.place_of_death?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="card shadow">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0">Loading deceased records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="fas fa-users me-2"></i>
            Select Deceased for Invoice Management
          </h5>
          <span className="badge bg-light text-dark">
            {deceasedList.length} total records
          </span>
        </div>
      </div>
      <div className="card-body">
        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, deceased ID, cause of death, or place of death..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4 text-end">
            <span className="badge bg-secondary">
              {filteredDeceased.length} deceased found
            </span>
          </div>
        </div>

        {/* Debug Info */}
        <div className="alert alert-info mb-3">
          <small>
            <i className="fas fa-info-circle me-2"></i>
            Showing deceased records from the mortuary system. Select a deceased person to manage their invoices.
          </small>
        </div>

        {/* Deceased List */}
        {filteredDeceased.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No Deceased Found</h5>
            <p className="text-muted">
              {searchTerm ? 'No records match your search. Try different keywords.' : 'No deceased records available in the system.'}
            </p>
            {deceasedList.length > 0 && searchTerm && (
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="row">
            {filteredDeceased.map((deceased) => (
              <div key={deceased.id} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100 border shadow-sm">
                  <div className="card-header bg-light">
                    <h6 className="card-title mb-0 text-primary">
                      <i className="fas fa-user me-2"></i>
                      {deceased.name || 'Unknown Name'}
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="deceased-details">
                      <p className="mb-2">
                        <strong>Deceased ID:</strong><br />
                        <span className="text-muted">{deceased.deceased_id}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Date of Death:</strong><br />
                        <span className="text-muted">
                          {deceased.dod ? new Date(deceased.dod).toLocaleDateString() : 'N/A'}
                        </span>
                      </p>
                      <p className="mb-2">
                        <strong>Cause of Death:</strong><br />
                        <span className="text-muted">{deceased.cause_of_death || 'N/A'}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Place of Death:</strong><br />
                        <span className="text-muted">{deceased.place_of_death || 'N/A'}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Location:</strong><br />
                        <span className="text-muted">{deceased.address || 'N/A'}</span>
                      </p>
                      <p className="mb-0">
                        <strong>Gender:</strong><br />
                        <span className="text-muted">{deceased.gender || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="card-footer bg-transparent">
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => onSelectDeceased(deceased)}
                    >
                      <i className="fas fa-file-invoice me-2"></i>
                      Manage Invoices
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show original data structure for debugging */}
        {deceasedList.length > 0 && (
          <details className="mt-4">
            <summary className="btn btn-sm btn-outline-secondary">
              <i className="fas fa-bug me-2"></i>
              Debug: View Raw Data Structure
            </summary>
            <div className="mt-2 p-3 bg-dark text-light rounded">
              <pre className="mb-0" style={{ fontSize: '0.8rem' }}>
                {JSON.stringify(deceasedList.slice(0, 2), null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default DeceasedSelector;