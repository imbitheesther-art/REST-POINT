// components/PaymentForm.jsx
import React, { useState } from 'react';

const PaymentForm = ({ deceased, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    deceased_id: deceased.id,
    amount: '',
    payment_method: 'Cash',
    reference_code: '', // Removed default reference code
    description: `Payment for ${deceased.full_name}`
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-success text-white">
        <h5 className="card-title mb-0">
          <i className="fas fa-money-bill-wave me-2"></i>
          Record Payment
        </h5>
      </div>
      <div className="card-body">
        <div className="alert alert-info">
          <strong>Recording payment for:</strong> {deceased.full_name} ({deceased.deceased_id})
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Amount (KES) *</label>
                <input
                  type="number"
                  className="form-control"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Payment Method *</label>
                <select
                  className="form-select"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Reference Code</label>
                <input
                  type="text"
                  className="form-control"
                  name="reference_code"
                  value={formData.reference_code}
                  onChange={handleChange}
                  placeholder="Enter reference code (optional)"
                />
                <small className="text-muted">
                  Leave blank for automatic sytem   generation or enter custom reference
                </small>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter payment description"
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <i className="fas fa-save me-1"></i>
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;