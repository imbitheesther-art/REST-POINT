// routes/chargeSettingsRoutes.js
const express = require('express');
const router = express.Router();

const {
  updateChargeSettings,
  getChargeSettings,
  getBillingSummary,
  recalculateBalance
} = require('../controllers/chargeSettings/chargeSetting');

// Update charge settings
router.post('/update-charge-settings/:id', updateChargeSettings);

// Get charge settings
router.get('/charge-settings', getChargeSettings);

// Get billing summary
router.get('/billing-summary/:id', getBillingSummary);

module.exports = router;
