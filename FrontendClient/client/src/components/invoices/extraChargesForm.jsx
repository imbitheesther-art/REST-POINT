// components/ExtraChargeForm.jsx
import React, { useState } from 'react';

const ExtraChargeForm = ({ deceased, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    deceased_id: deceased.id,
    charge_type: '',
    amount: '',
    description: '',
    notes: '',
    service_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.charge_type || !formData.amount || formData.amount <= 0) {
      alert('Please fill in all required fields');
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
      <div className="card-header bg-warning text-white">
        <h5 className="card-title mb-0">
          <i className="fas fa-plus-circle me-2"></i>
          Add Extra Charge
        </h5>
      </div>
      <div className="card-body">
        <div className="alert alert-info">
          <strong>Adding charge for:</strong> {deceased.full_name} ({deceased.deceased_id})
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Charge Type *</label>
                <input
                  type="text"
                  className="form-control"
                  name="charge_type"
                  value={formData.charge_type}
                  onChange={handleChange}
                  placeholder="e.g., Transportation, Casket, etc."
                  required
                />
              </div>
            </div>
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
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the charge"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Service Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="service_date"
                  value={formData.service_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes about this charge..."
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-warning">
              <i className="fas fa-save me-1"></i>
              Add Charge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExtraChargeForm;