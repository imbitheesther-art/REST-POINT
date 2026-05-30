// components/InvoiceForm.jsx
import React, { useState, useEffect } from 'react';

const InvoiceForm = ({ deceased, invoice, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    deceased_name: '',
    nok: '',
    id_number: '',
    dod: '',
    address: '',
    phone: '',
    cause_of_death: '',
    mortuary_name: 'Professional Mortuary Services',
    mortuary_phone: '+254 740 045 355',
    items: [{ service: '', qty: 1, amount: 0 }],
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 0,
    signature_url: '',
    deceased_id: '', // Add deceased_id field
    invoice_type: 'deceased' // Add invoice type field
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deceased && !isEditing) {
      setFormData(prev => ({
        ...prev,
        deceased_name: deceased.name || '',
        id_number: deceased.deceased_id || '',
        dod: deceased.dod || '',
        address: deceased.address || '',
        cause_of_death: deceased.cause_of_death || '',
        invoice_number: generateInvoiceNumber(),
        deceased_id: deceased.id || deceased.deceased_id, // Set deceased_id from deceased object
        invoice_type: 'deceased'
      }));
    }

    if (invoice) {
      const items = typeof invoice.items === 'string' ? 
        JSON.parse(invoice.items) : invoice.items;
      
      setFormData({
        invoice_number: invoice.invoice_number || generateInvoiceNumber(),
        deceased_name: invoice.deceased_name || '',
        nok: invoice.nok || '',
        id_number: invoice.id_number || '',
        dod: invoice.dod || '',
        address: invoice.address || '',
        phone: invoice.phone || '',
        cause_of_death: invoice.cause_of_death || '',
        mortuary_name: invoice.mortuary_name || 'Professional Mortuary Services',
        mortuary_phone: invoice.mortuary_phone || '+254 740 045 355',
        items: items,
        subtotal: invoice.subtotal || 0,
        tax_rate: invoice.tax_rate || 0,
        tax_amount: invoice.tax_amount || 0,
        total_amount: invoice.total_amount || 0,
        signature_url: invoice.signature_url || '',
        deceased_id: invoice.deceased_id || '', // Include deceased_id from invoice
        invoice_type: invoice.invoice_type || 'deceased'
      });
      calculateTotals(items, invoice.tax_rate || 0);
    } else {
      setFormData(prev => ({
        ...prev,
        invoice_number: generateInvoiceNumber(),
        invoice_type: deceased ? 'deceased' : 'general'
      }));
    }
  }, [deceased, invoice, isEditing]);

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
  };

  const calculateTotals = (items, taxRate = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.amount), 0);
    const tax_amount = (subtotal * taxRate) / 100;
    const total_amount = subtotal + tax_amount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount,
      total_amount,
      tax_rate: taxRate
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'tax_rate') {
      const taxRate = parseFloat(value) || 0;
      calculateTotals(formData.items, taxRate);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = field === 'qty' || field === 'amount' ? 
      parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
    calculateTotals(updatedItems, formData.tax_rate);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { service: '', qty: 1, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
      calculateTotals(updatedItems, formData.tax_rate);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.invoice_number) {
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.items.some(item => !item.service || item.amount <= 0)) {
      alert('Please fill in all service items with valid amounts');
      setLoading(false);
      return;
    }

    // Ensure deceased_id is included only for deceased invoices
    const submissionData = {
      ...formData,
      deceased_id: formData.invoice_type === 'deceased' ? 
        (formData.deceased_id || deceased?.id || deceased?.deceased_id) : 
        null
    };

    try {
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">
          <i className="fas fa-file-invoice me-2"></i>
          {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
          {deceased && (
            <small className="ms-2 opacity-75">for {deceased.name} ({deceased.deceased_id})</small>
          )}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Invoice Type Selection */}
          {!deceased && !isEditing && (
            <div className="row mb-4">
              <div className="col-12">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-tag me-2"></i>
                  Invoice Type
                </h6>
                <div className="mb-3">
                  <label className="form-label">Select Invoice Type *</label>
                  <select
                    className="form-control"
                    name="invoice_type"
                    value={formData.invoice_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="deceased">Deceased Services</option>
                    <option value="general">General/Internal Use</option>
                  </select>
                  <small className="text-muted">
                    Choose "Deceased Services" for funeral-related invoices or "General/Internal Use" for other purposes
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Deceased Information - Only show if invoice type is deceased or deceased is provided */}
          {(formData.invoice_type === 'deceased' || deceased) && (
            <div className="row mb-4">
              <div className="col-12">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-user me-2"></i>
                  Deceased Information
                </h6>
                {deceased ? (
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4">
                          <p><strong>Name:</strong> {deceased?.name}</p>
                          <p><strong>Deceased ID:</strong> {deceased?.deceased_id}</p>
                          <p><strong>Database ID:</strong> {deceased?.id}</p>
                        </div>
                        <div className="col-md-4">
                          <p><strong>Date of Death:</strong> {deceased?.dod ? new Date(deceased.dod).toLocaleDateString() : 'N/A'}</p>
                          <p><strong>Cause of Death:</strong> {deceased?.cause_of_death || 'N/A'}</p>
                        </div>
                        <div className="col-md-4">
                          <p><strong>Place of Death:</strong> {deceased?.place_of_death || 'N/A'}</p>
                          <p><strong>Location:</strong> {deceased?.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">Deceased Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="deceased_name"
                              value={formData.deceased_name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">ID Number</label>
                            <input
                              type="text"
                              className="form-control"
                              name="id_number"
                              value={formData.id_number}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">Date of Death</label>
                            <input
                              type="date"
                              className="form-control"
                              name="dod"
                              value={formData.dod}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Next of Kin</label>
                            <input
                              type="text"
                              className="form-control"
                              name="nok"
                              value={formData.nok}
                              onChange={handleInputChange}
                              placeholder="Enter next of kin name"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Cause of Death</label>
                            <input
                              type="text"
                              className="form-control"
                              name="cause_of_death"
                              value={formData.cause_of_death}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input
                              type="text"
                              className="form-control"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden deceased_id field for form submission */}
          {deceased && (
            <input
              type="hidden"
              name="deceased_id"
              value={deceased.id || deceased.deceased_id}
            />
          )}

          {/* Basic Information */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h6 className="text-primary mb-3">
                <i className="fas fa-info-circle me-2"></i>
                Invoice Information
              </h6>
              
              <div className="mb-3">
                <label className="form-label">Invoice Number *</label>
                <input
                  type="text"
                  className="form-control"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  required
                  disabled={isEditing}
                />
                <small className="text-muted">Auto-generated invoice number</small>
              </div>

              {/* Only show deceased name field if not deceased type or no deceased provided */}
              {(formData.invoice_type !== 'deceased' && !deceased) && (
                <div className="mb-3">
                  <label className="form-label">
                    {formData.invoice_type === 'general' ? 'Client/Recipient Name' : 'Deceased Name'} *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="deceased_name"
                    value={formData.deceased_name}
                    onChange={handleInputChange}
                    required
                    placeholder={formData.invoice_type === 'general' ? 'Enter client or recipient name' : 'Enter deceased name'}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Contact Person</label>
                <input
                  type="text"
                  className="form-control"
                  name="nok"
                  value={formData.nok}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                />
              </div>

              {/* Deceased ID Field (read-only for reference) - Only show for deceased invoices */}
              {deceased && (
                <div className="mb-3">
                  <label className="form-label">Deceased Database ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={deceased?.id || formData.deceased_id}
                    readOnly
                    disabled
                  />
                  <small className="text-muted">This ID will be sent to the backend</small>
                </div>
              )}
            </div>

            <div className="col-md-6">
              <h6 className="text-primary mb-3">
                <i className="fas fa-building me-2"></i>
                Service Provider Information
              </h6>
              
              <div className="mb-3">
                <label className="form-label">Service Provider Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="mortuary_name"
                  value={formData.mortuary_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Service Provider Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="mortuary_phone"
                  value={formData.mortuary_phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Signature URL (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  name="signature_url"
                  value={formData.signature_url}
                  onChange={handleInputChange}
                  placeholder="URL to digital signature image"
                />
              </div>
            </div>
          </div>

          {/* Services Items */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-primary mb-0">
                  <i className="fas fa-list me-2"></i>
                  Services & Items
                </h6>
                <button type="button" className="btn btn-sm btn-success" onClick={addItem}>
                  <i className="fas fa-plus me-1"></i> Add Item
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th width="45%">Service/Item Description *</th>
                      <th width="15%">Quantity</th>
                      <th width="20%">Unit Price (KES)</th>
                      <th width="15%">Amount (KES)</th>
                      <th width="5%">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={item.service}
                            onChange={(e) => handleItemChange(index, 'service', e.target.value)}
                            placeholder="Enter service or item description"
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                            min="1"
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={item.amount}
                            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                            step="0.01"
                            min="0"
                            required
                          />
                        </td>
                        <td className="align-middle fw-bold">
                          KES {(item.qty * item.amount).toLocaleString()}
                        </td>
                        <td className="align-middle">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => removeItem(index)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tax and Totals */}
          <div className="row mb-4">
            <div className="col-md-6 offset-md-6">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <div className="row mb-2">
                    <div className="col-6">
                      <strong>Subtotal:</strong>
                    </div>
                    <div className="col-6 text-end">
                      <strong>KES {formData.subtotal.toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-6">
                      <label className="form-label">Tax Rate (%):</label>
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control"
                        name="tax_rate"
                        value={formData.tax_rate}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  {formData.tax_amount > 0 && (
                    <div className="row mb-2">
                      <div className="col-6">
                        <strong>Tax Amount:</strong>
                      </div>
                      <div className="col-6 text-end">
                        <strong>KES {formData.tax_amount.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}
                  <div className="row mt-3 pt-2 border-top">
                    <div className="col-6">
                      <h5 className="text-primary">Total Amount:</h5>
                    </div>
                    <div className="col-6 text-end">
                      <h5 className="text-success">KES {formData.total_amount.toLocaleString()}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onCancel}
                  disabled={loading}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      {isEditing ? 'Update Invoice' : 'Create Invoice'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;