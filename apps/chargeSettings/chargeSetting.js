// controllers/chargeSettingsController.js
const { safeQuery } = require('../../configurations/sqlConfig/db');

// ====================== UPDATE CHARGE SETTINGS ======================
async function updateChargeSettings(req, res) {
  try {
    const { id } = req.params;
    const {
      rateProfile,
      currency,
      chargeType,
      dailyRate,
      hourlyRate,
      usdRate
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Deceased ID is required'
      });
    }

    if (chargeType === 'daily' && (!dailyRate || dailyRate <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Valid daily rate is required'
      });
    }

    if (chargeType === 'hourly' && (!hourlyRate || hourlyRate <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Valid hourly rate is required'
      });
    }

    if (currency === 'USD' && (!usdRate || usdRate <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Valid USD exchange rate is required'
      });
    }

    const deceasedData = await safeQuery(
      'SELECT * FROM deceased WHERE deceased_id = ?',
      [id]
    );

    if (deceasedData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deceased not found'
      });
    }

    let finalDailyRate = 0;

    if (chargeType === 'daily') {
      finalDailyRate = parseInt(dailyRate);
    } else if (chargeType === 'hourly') {
      finalDailyRate = parseInt(hourlyRate) * 24;
    }

    await safeQuery(
      `
      UPDATE deceased 
      SET rate_category = ?, 
          currency = ?, 
          usd_charge_rate = ?,
          updated_at = NOW()
      WHERE deceased_id = ?
      `,
      [
        rateProfile,
        currency,
        currency === 'USD' ? parseInt(usdRate) : 130,
        id
      ]
    );

    await safeQuery(
      `
      INSERT INTO charge_updates 
      (deceased_id, charge_date, amount, currency, charge_type, description)
      VALUES (?, CURDATE(), ?, ?, 'settings_update', ?)
      `,
      [
        id,
        finalDailyRate,
        currency,
        `Billing settings updated: ${rateProfile} profile, ${currency} currency, ${chargeType} billing`
      ]
    );

    const existingCharges = await safeQuery(
      `
      SELECT COUNT(*) as count FROM charge_updates 
      WHERE deceased_id = ? AND charge_type = 'daily'
      `,
      [id]
    );

    if (existingCharges[0].count === 0) {
      const admissionDate = deceasedData[0].date_admitted || deceasedData[0].created_at;
      const today = new Date();

      const daysInMorgue = Math.ceil(
        (today - new Date(admissionDate)) / (1000 * 60 * 60 * 24)
      );

      if (daysInMorgue > 0) {
        for (let i = 0; i < daysInMorgue; i++) {
          const chargeDate = new Date(admissionDate);
          chargeDate.setDate(chargeDate.getDate() + i);

          await safeQuery(
            `
            INSERT INTO charge_updates 
            (deceased_id, charge_date, amount, currency, charge_type, description)
            VALUES (?, ?, ?, ?, 'daily', ?)
            `,
            [
              id,
              chargeDate.toISOString().split('T')[0],
              finalDailyRate,
              currency,
              `Daily storage charge (${i + 1} day${i + 1 > 1 ? 's' : ''} at ${currency === 'USD' ? '$' : 'KES '}${finalDailyRate}/day)`
            ]
          );
        }
      }
    }

    await recalculateBalance(id);

    res.status(200).json({
      success: true,
      message: 'Charge settings updated successfully',
      data: {
        id,
        rateProfile,
        currency,
        chargeType,
        dailyRate: finalDailyRate,
        usdRate: currency === 'USD' ? parseInt(usdRate) : null
      }
    });

  } catch (error) {
    console.error('Error updating charge settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update charge settings',
      error: error.message
    });
  }
}


// ====================== GET CHARGE SETTINGS ======================
async function getChargeSettings(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Deceased ID is required'
      });
    }

    const deceasedData = await safeQuery(
      `
      SELECT 
         deceased_id,
         full_name,
         rate_category as rateProfile,
         currency,
         usd_charge_rate as usdRate,
         date_admitted,
         created_at,
         total_mortuary_charge
       FROM deceased 
       WHERE deceased_id = ?
      `,
      [id]
    );

    if (deceasedData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deceased not found'
      });
    }

    const chargeHistory = await safeQuery(
      `
      SELECT * FROM charge_updates 
      WHERE deceased_id = ? AND charge_type = 'daily'
      ORDER BY charge_date DESC
      LIMIT 1
      `,
      [id]
    );

    let chargeType = 'daily';
    let dailyRate = 0;
    let hourlyRate = 0;

    if (chargeHistory.length > 0) {
      dailyRate = chargeHistory[0].amount;

      if (dailyRate % 24 === 0 && dailyRate > 240) {
        chargeType = 'hourly';
        hourlyRate = dailyRate / 24;
      }
    }

    const currentDailyRate = deceasedData[0].currency === 'KES'
      ? (deceasedData[0].rateProfile === 'premium' ? 5000 : 3000)
      : deceasedData[0].usdRate || 130;

    res.status(200).json({
      success: true,
      data: {
        ...deceasedData[0],
        chargeType,
        dailyRate: dailyRate || currentDailyRate,
        hourlyRate,
        currentBalance: deceasedData[0].total_mortuary_charge || 0
      }
    });

  } catch (error) {
    console.error('Error getting charge settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get charge settings',
      error: error.message
    });
  }
}


// ====================== RECALCULATE BALANCE ======================
async function recalculateBalance(deceased_id) {
  try {
    const chargesResult = await safeQuery(
      `
      SELECT COALESCE(SUM(amount), 0) as total_charges 
      FROM charge_updates 
      WHERE deceased_id = ?
      `,
      [deceased_id]
    );

    const paymentsResult = await safeQuery(
      `
      SELECT COALESCE(SUM(amount), 0) as total_payments 
      FROM payments 
      WHERE deceased_id = ?
      `,
      [deceased_id]
    );

    const totalCharges = parseFloat(chargesResult[0]?.total_charges || 0);
    const totalPayments = parseFloat(paymentsResult[0]?.total_payments || 0);
    const balance = totalCharges - totalPayments;

    await safeQuery(
      `UPDATE deceased SET total_mortuary_charge = ? WHERE deceased_id = ?`,
      [balance, deceased_id]
    );

    return balance;
  } catch (error) {
    console.error('Error recalculating balance:', error);
    throw error;
  }
}


// ====================== GET BILLING SUMMARY ======================
async function getBillingSummary(req, res) {
  try {
    const { id } = req.params;

    const deceasedInfo = await safeQuery(
      `
      SELECT 
         deceased_id,
         full_name,
         rate_category,
         currency,
         usd_charge_rate,
         total_mortuary_charge,
         date_admitted,
         created_at
       FROM deceased 
       WHERE deceased_id = ?
      `,
      [id]
    );

    if (!deceasedInfo.length) {
      return res.status(404).json({
        success: false,
        message: 'Deceased not found'
      });
    }

    const chargeHistory = await safeQuery(
      `
      SELECT 
         charge_date,
         amount,
         currency,
         charge_type,
         description
       FROM charge_updates 
       WHERE deceased_id = ?
       ORDER BY charge_date DESC
      `,
      [id]
    );

    const paymentHistory = await safeQuery(
      `
      SELECT 
         payment_date,
         amount,
         currency,
         payment_method,
         reference
       FROM payments 
       WHERE deceased_id = ?
       ORDER BY payment_date DESC
      `,
      [id]
    );

    const totalCharges = chargeHistory.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const totalPayments = paymentHistory.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const outstandingBalance = totalCharges - totalPayments;

    // Update the deceased record with calculated total
    await safeQuery(
      `UPDATE deceased SET total_mortuary_charge = ? WHERE deceased_id = ?`,
      [outstandingBalance, id]
    );

    res.status(200).json({
      success: true,
      data: {
        deceased: {
          ...deceasedInfo[0],
          total_mortuary_charge: outstandingBalance
        },
        totals: {
          charges: totalCharges,
          payments: totalPayments,
          balance: outstandingBalance
        },
        chargeHistory,
        paymentHistory
      }
    });

  } catch (error) {
    console.error('Error getting billing summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get billing summary',
      error: error.message
    });
  }
}


// ====================== EXPORTS (Bottom Style) ======================
module.exports = {
  updateChargeSettings,
  getChargeSettings,
  getBillingSummary,
  recalculateBalance
};
