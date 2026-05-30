// components/DeceasedFinancialTable.jsx
import React, { useState } from 'react';

const DeceasedFinancialTable = ({ deceasedList, loading, onViewDetails, onCreateSystemInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredDeceased = deceasedList.filter(deceased => {
    const matchesSearch = deceased.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deceased.deceased_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'paid' && parseFloat(deceased.balance || 0) <= 0) ||
                         (filterStatus === 'pending' && parseFloat(deceased.balance || 0) > 0);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDeceased.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDeceased = filteredDeceased.slice(startIndex, startIndex + itemsPerPage);

  const getBalanceStatus = (balance) => {
    const bal = parseFloat(balance || 0);
    if (bal === 0) return 'success';
    if (bal > 0) return 'warning';
    return 'danger';
  };

  const getBalanceText = (balance) => {
    const bal = parseFloat(balance || 0);
    if (bal === 0) return 'Paid';
    if (bal > 0) return `KES ${bal.toLocaleString()}`;
    return `Overpaid: KES ${Math.abs(bal).toLocaleString()}`;
  };

  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card shadow border-0">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0 text-muted">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow border-0">
      <div className="card-header bg-white d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 py-3">
        <h5 className="card-title mb-0 d-flex align-items-center">
          <i className="fas fa-table me-2 text-primary"></i>
          Deceased Financial Summary
        </h5>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary rounded-pill">{filteredDeceased.length} records</span>
        </div>
      </div>
      
      <div className="card-body p-0 p-md-3">
        {/* Filters Section */}
        <div className="row g-2 mb-3 p-3 bg-light rounded">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="col-12 col-md-6 col-lg-3">
            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <select
              className="form-select form-select-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-2">
            <div className="d-flex flex-wrap gap-1 justify-content-start justify-content-md-end">
              <span className="badge bg-success rounded-pill fs-7">
                Paid: {deceasedList.filter(d => parseFloat(d.balance || 0) <= 0).length}
              </span>
              <span className="badge bg-warning rounded-pill fs-7">
                Pending: {deceasedList.filter(d => parseFloat(d.balance || 0) > 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="d-block d-lg-none">
          {paginatedDeceased.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <p className="text-muted mb-0">No deceased records found</p>
              {searchTerm && (
                <p className="text-muted fs-7">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            <div className="row g-2">
              {paginatedDeceased.map((deceased) => (
                <div key={deceased.id} className="col-12">
                  <div className="card border shadow-sm mb-2">
                    <div className="card-body p-3">
                      <div className="row g-2">
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="card-title mb-1 text-primary fw-bold">
                              {deceased.full_name}
                            </h6>
                            <span className={`badge bg-${getBalanceStatus(deceased.balance)} fs-7`}>
                              {getBalanceText(deceased.balance)}
                            </span>
                          </div>
                          <div className="d-flex flex-wrap gap-2 fs-7 text-muted">
                            <span>
                              <i className="fas fa-id-card me-1"></i>
                              {deceased.deceased_id}
                            </span>
                            <span>
                              <i className="fas fa-venus-mars me-1"></i>
                              {deceased.gender}
                            </span>
                          </div>
                        </div>

                        <div className="col-6">
                          <small className="text-muted d-block">Date of Death</small>
                          <span className="fw-semibold">{formatDate(deceased.date_of_death)}</span>
                        </div>

                        <div className="col-6">
                          <small className="text-muted d-block">Status</small>
                          <span className={`badge ${
                            deceased.status === 'Released' ? 'bg-success' : 
                            deceased.status === 'Received' ? 'bg-info' : 'bg-secondary'
                          } fs-7`}>
                            {deceased.status}
                          </span>
                        </div>

                        <div className="col-6">
                          <small className="text-muted d-block">Total Charges</small>
                          <span className="fw-semibold text-primary">{formatCurrency(deceased.total_charges)}</span>
                        </div>

                        <div className="col-6">
                          <small className="text-muted d-block">Total Payments</small>
                          <span className="fw-semibold text-success">{formatCurrency(deceased.total_payments)}</span>
                        </div>

                        <div className="col-12 mt-2">
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => onViewDetails(deceased)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                              <span className="d-none d-sm-inline ms-1">View</span>
                            </button>
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => onCreateSystemInvoice(deceased.id)}
                              title="Generate System Invoice"
                            >
                              <i className="fas fa-file-invoice"></i>
                              <span className="d-none d-sm-inline ms-1">Invoice</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="d-none d-lg-block">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th width="15%">Deceased Name</th>
                  <th width="10%">Deceased ID</th>
                  <th width="10%">Date of Death</th>
                  <th width="12%">Total Charges</th>
                  <th width="12%">Total Payments</th>
                  <th width="12%">Balance</th>
                  <th width="10%">Status</th>
                  <th width="19%">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDeceased.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                      <p className="text-muted mb-0">No deceased records found</p>
                      {searchTerm && (
                        <p className="text-muted fs-7">Try adjusting your search terms</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedDeceased.map((deceased) => (
                    <tr key={deceased.id}>
                      <td>
                        <div>
                          <strong className="d-block">{deceased.full_name}</strong>
                          <small className="text-muted">{deceased.gender}</small>
                        </div>
                      </td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">{deceased.deceased_id}</code>
                      </td>
                      <td>
                        {formatDate(deceased.date_of_death)}
                      </td>
                      <td>
                        <strong className="text-primary">
                          {formatCurrency(deceased.total_charges)}
                        </strong>
                      </td>
                      <td>
                        <span className="text-success">
                          {formatCurrency(deceased.total_payments)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${getBalanceStatus(deceased.balance)}`}>
                          {getBalanceText(deceased.balance)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          deceased.status === 'Released' ? 'bg-success' : 
                          deceased.status === 'Received' ? 'bg-info' : 'bg-secondary'
                        }`}>
                          {deceased.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => onViewDetails(deceased)}
                            title="View Details"
                          >
                            <i className="fas fa-eye me-1"></i>
                            View
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={() => onCreateSystemInvoice(deceased.id)}
                            title="Generate System Invoice"
                          >
                            <i className="fas fa-file-invoice me-1"></i>
                            Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredDeceased.length > 0 && (
          <div className="row align-items-center mt-3 p-3 border-top">
            <div className="col-12 col-md-6">
              <small className="text-muted">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDeceased.length)} of {filteredDeceased.length} entries
              </small>
            </div>
            <div className="col-12 col-md-6">
              <nav aria-label="Table pagination">
                <ul className="pagination pagination-sm justify-content-center justify-content-md-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeceasedFinancialTable;