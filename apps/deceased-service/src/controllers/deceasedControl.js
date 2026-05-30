const asyncHandler = require('express-async-handler');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const apicache = require('apicache');
const   crypto  =   require('crypto');

const { Logger } = require('../../utilities/logger/logger');
const { safeQuery } = require('../../configurations/sqlConfig/db');
const { getKenyaTimeISO } = require('../../utilities/timeStamps/timeStamps');
const { getDeceasedCached,setDeceasedCached,mergeDeceasedCached,
deleteDeceasedCached, refreshAllDeceasedCache} = require('../../cachemanager/cachemanager');

// ----------------- Helpers & Constants -----------------
const Colors = {
  // Primary & Accent Colors
  primaryDark: '#1E293B',
  accentRed: '#EF4444',
  accentBlue: '#3B82F6',
  successGreen: '#10B981',
  dangerRed: '#DC2626',
  warningYellow: '#F59E0B',
  infoBlue: '#0EA5E9',

  // Grayscale
  lightGray: '#F8FAFC',
  mediumGray: '#E2E8F0',
  darkGray: '#334155',
  textMuted: '#64748B',
  borderColor: '#CBD5E1',

  // UI Elements
  cardBg: '#FFFFFF',
  cardShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  activeTab: '#F0F4F8',
  colorAdjuster: '#8884d8',

  // CSS-Like Colors (from Bootstrap / Themes)
  cssVars: {
    greenish: '#c3e703',
    bluish: '#96d1c7',
    black: '#000000',
    white: '#ffffff',
    primaryColorBgYellow: '#FFD600',
    backgroundMain: '#f8f9fa',
    primaryColor: '#0071e3',
    pinkColor: '#6B5B95',
    indigo: '#6610f2',
    purple: '#6f42c1',
    pink: '#d63384',
    red: '#dc3545',
    orange: '#fd7e14',
    yellow: '#ffc107',
    green: '#198754',
    teal: '#20c997',
    cyan: '#0dcaf0',
    gray: '#6c757d',
    grayDark: '#343a40',
    gray100: '#f8f9fa',
    gray200: '#e9ecef',
    gray300: '#dee2e6',
    gray400: '#ced4da',
    gray500: '#adb5bd',
    gray600: '#6c757d',
    gray700: '#495057',
    gray800: '#343a40',
    gray900: '#212529',
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    info: '#0dcaf0',
    warning: '#ffc107',
    danger: '#dc3545',
    light: '#f8f9fa',
    dark: '#212529',
  },
};



//   generating  deceased   id  

function generateUniqueDeceasedId(fullName) {
  const prefix = (fullName?.split(" ")[0] || "NONAME")
    .substring(0, 3)
    .toUpperCase();

  const timestamp = Date.now().toString(36).toUpperCase();

  // 4 bytes = 8 hex chars (VERY random)
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `${prefix}-${timestamp}-${random}`;
}

function sanitize(value) {
  return value === undefined ? null : value;
}

// ----------------- Setup -----------------
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
const ALL_DECEASED_CACHE_KEY = 'all_deceased';



//  Register Deceased 
const registerDeceased = asyncHandler(async (req, res) => {

  //getting  data   from teh  request  body  

  Logger.info(`Getting req.body  data`);
  try {
    const {
      admission_number,
      cause_of_death,
      date_of_birth,
      date_of_death,    
      full_name,
      gender,
      place_of_death,
      county,
      location,
      national_id,

    } = req.body;
    
    Logger.info(`Running external functionalities ,  date  and   timestamps`);
    //running  extretan  function     4   kenyan iso   time  stamps 
    const date_registered = getKenyaTimeISO();
    const date_admitted = getKenyaTimeISO();
    const created_at = getKenyaTimeISO();

    // NO MORTUARY ID ANYMORE
    Logger.info(`Genereting  Deceased  Unique Identification`);
    const deceased_id = generateUniqueDeceasedId(full_name);
    
    const insertValues = [
      sanitize(deceased_id),
      sanitize(admission_number),
      sanitize(cause_of_death),
      sanitize(date_admitted),
      sanitize(date_of_birth),
      sanitize(date_of_death),
      sanitize(date_registered),
      sanitize(full_name),
      sanitize(gender),
      sanitize(place_of_death),
      sanitize(county),
      sanitize(national_id),
      sanitize(created_at),
      sanitize(location),
    ];

 
    const insertQuery = `
      INSERT INTO deceased (
        deceased_id, admission_number, cause_of_death, date_admitted,
        date_of_birth, date_of_death, date_registered, full_name,
        gender, place_of_death, county,
        national_id, created_at, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await safeQuery(insertQuery, insertValues);
    Logger.info(`Inserting  data  values  into the  database then updating cache`);
    // Refresh cache in background
    safeQuery(`
      SELECT 
        d.*,
        CASE WHEN p.deceased_id IS NOT NULL THEN 1 ELSE 0 END AS has_autopsy
      FROM deceased d
      LEFT JOIN postmortem p ON d.deceased_id = p.deceased_id
      ORDER BY d.date_of_death DESC
    `)
      .then((data) => cache.set(ALL_DECEASED_CACHE_KEY, data))
      .catch((err) => {

        Logger.error(`Error Caching a   deceased ` , {
          error:   err,
          stack:  err.stack,
          module:  'register  deceased',
          action:  'Cache_Setting'
        });
        
      });

    res.status(200).json({
      message: 'Deceased registered successfully',
      deceased_id,
    });
  } catch (err) {

   Logger.error(`Error  Registering a  deceased ` ,  {
    error:  err,
    stack:  err.stack,
    module:   "deceased   Registartion",
    action:   "deceased_registartion"

   });
 
    res.status(500).json({
      message: 'Internal Server Error',
      sucess:  false
    });
  }
});


// ----------------- Get All Deceased -----------------


let isPopulatingCache = false;
let cachePromise = null;

const getAllRegisteredDeceased = asyncHandler(async (req, res) => {

  Logger.info(` Getting all  deceased  `  ,   {
    actions: 'get'
  });


  try {

    Logger.info(`Getting  data   from  cache  first`  , {
      actions:   'cache'
    });
    let deceasedRecords = cache.get(ALL_DECEASED_CACHE_KEY);

    if (!deceasedRecords) {
      if (!isPopulatingCache) {
        isPopulatingCache = true;
        cachePromise = safeQuery(`
        SELECT 
  d.*,
  CASE WHEN p.deceased_id IS NOT NULL THEN 1 ELSE 0 END AS has_autopsy,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'kin_name', k.full_name,
      'kin_relationship', k.relationship,
      'kin_contact', k.contact,
      'kin_email', k.email
    )
  ) AS next_of_kin
FROM deceased d
LEFT JOIN postmortem p ON d.deceased_id = p.deceased_id
LEFT JOIN next_of_kin k ON d.deceased_id = k.deceased_id
GROUP BY d.deceased_id
ORDER BY d.date_of_death DESC;

        `)
          .then((data) => {
            cache.set(ALL_DECEASED_CACHE_KEY, data);
            isPopulatingCache = false;
            return data;
          })
          .catch((err) => {
            isPopulatingCache = false;
          
            Logger.error(`Error   populating the  cache`  ,  {
              actions:   'populating_cahe',
              error:   err,
              stack:   err.stack
            });


            throw err;
          });
      }
      deceasedRecords = await cachePromise;
    }

    res.status(200).json({
      message: 'Deceased records fetched successfully',
      count: deceasedRecords.length,
      data: deceasedRecords,
    });


  } catch (err) {
     Logger.error(`Error   fetchind   deceased  data`  ,  {
      actions:   'fectch',
      error:   err,
      stack:   err.stack
     });


    res
      .status(500)
      .json(
        { 
          sucess:  false,
          message: 'Error  Getting deceased  records ', error: err.message 

        }
      );
  }
});


// ----------------- GET DECEASED BY ID (With Global Cache Manager) -----------------

const getDeceasedById = asyncHandler(async (req, res) => {
  const id = req.query.id || req.params.id || req.body.deceased_id;

  if (!id) {
    return res.status(400).json({ message: "Deceased ID is required" });
  }

  try {
    /** ✅ 1. Check Cache */
    let cachedDeceased = getDeceasedCached(id);
    let isCached = false;

    /** ✅ 2. Fetch Deceased */
    const deceasedRows = await safeQuery(
      `
      SELECT 
        d.*, 
        u.name AS registered_by_name,
        u.username AS registered_by_username,
        u.role AS registered_by_role
      FROM deceased d
      LEFT JOIN users u ON d.registered_by_user_id = u.id
      WHERE d.deceased_id = ? OR d.id = ?
      `,
      [id, id]
    );

    const deceased = deceasedRows[0];
    if (!deceased) {
      return res.status(404).json({ message: "Deceased record not found" });
    }

    const deceasedNumericId = deceased.id;
    const deceasedStringId = deceased.deceased_id;

    /** Helper */
    const safeFetch = async (label, sql, params = []) => {
      try {
        return await safeQuery(sql, params);
      } catch (err) {
        console.error(`⚠️ ${label} query failed:`, err.message);
        logError(err);
        return [];
      }
    };

    /** Fetch Relations */
    const queries = {
      nextOfKin: safeFetch("next_of_kin", `SELECT * FROM next_of_kin WHERE deceased_id = ?`, [deceasedStringId]),
      dispatch: safeFetch("vehicle_dispatch", `SELECT * FROM vehicle_dispatch WHERE deceased_id = ?`, [deceasedStringId]),
      charges: safeFetch("charges", `SELECT * FROM charges WHERE deceased_id = ?`, [deceasedStringId]),
      payments: safeFetch("payments", `SELECT * FROM payments WHERE deceased_id = ?`, [deceasedStringId]),
      visitors: safeFetch("visitors", `SELECT * FROM visitors WHERE deceased_id = ?`, [deceasedStringId]),
      extraCharges: safeFetch("extra_charges", `SELECT * FROM extra_charges WHERE deceased_id = ?`, [deceasedStringId]),
      documents: safeFetch("documents", `SELECT * FROM documents WHERE deceased_id = ?`, [deceasedNumericId]),
      postmortem: safeFetch(
        "postmortem",
        `
        SELECT 
          p.*, 
          u.name AS pathologist_name 
        FROM postmortem p
        LEFT JOIN users u ON p.pathologist_id = u.id
        WHERE p.deceased_id = ?
        `,
        [deceasedStringId]
      ),
      coffin: safeFetch(
        "coffin_assignment",
        `
        SELECT 
          dc.*,
          c.custom_id AS coffin_custom_id,
          c.type AS coffin_type,
          c.material AS coffin_material,
          c.size AS coffin_size,
          c.color AS coffin_color,
          c.exact_price AS coffin_price,
          c.currency AS coffin_currency,
          c.price_usd AS coffin_price_usd,
          c.quantity AS coffin_quantity,
          c.supplier AS coffin_supplier,
          c.origin AS coffin_origin,
          c.category AS coffin_category,
          c.image_url AS coffin_image_url,
          c.notes AS coffin_notes
        FROM deceased_coffin dc
        LEFT JOIN coffins c ON dc.coffin_id = c.coffin_id
        WHERE dc.deceased_id = ?
        ORDER BY dc.assigned_date DESC, dc.created_at DESC
        LIMIT 1
      `,
        [deceasedStringId]
      ),
    };

    const results = await Promise.allSettled(Object.values(queries));
    const [
      nextOfKinRows,
      dispatchRows,
      chargesRows,
      paymentsRows,
      visitorsRows,
      extraChargesRows,
      rawDocumentsRows,
      postRows,
      coffinAssignmentRows,
    ] = results.map((r) => (r.status === "fulfilled" ? r.value : []));

    /** Documents with URL */
    const documentBaseUrl = process.env.FILE_BASE_URL || "http://localhost:5000/api/v1/restpoint/uploads";
    const documentsRows = rawDocumentsRows.map((doc) => ({
      ...doc,
      file_url: `${documentBaseUrl}/${doc.file_path || ""}`,
    }));

    /** Coffin Images */
    const coffinAssignment = coffinAssignmentRows[0] || null;
    let coffinImages = [];

    if (coffinAssignment?.coffin_image_url) {
      coffinImages = coffinAssignment.coffin_image_url
        .split(",")
        .map((u) => u.trim())
        .filter((u) => u.length > 3)
        .map((u) => (u.startsWith("http") ? u : `${documentBaseUrl}/${u}`));

      coffinImages = [...new Set(coffinImages)];
    }

    /** FINANCIALS (Cold room REMOVED completely) */

    const otherCharges = chargesRows.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const extraCharges = extraChargesRows.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalPayments = paymentsRows.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const billing = parseFloat(deceased.billing || 0);

    const totalCharges = billing + otherCharges + extraCharges;
    const balance = totalCharges - totalPayments;

    /** Coffin Data */
    const coffinData = coffinAssignment
      ? {
          assignment_id: coffinAssignment.id,
          coffin_id: coffinAssignment.coffin_id,
          custom_id: coffinAssignment.coffin_custom_id,
          type: coffinAssignment.coffin_type,
          material: coffinAssignment.coffin_material,
          size: coffinAssignment.coffin_size,
          color: coffinAssignment.coffin_color,
          price: coffinAssignment.coffin_price,
          currency: coffinAssignment.coffin_currency,
          price_usd: coffinAssignment.coffin_price_usd,
          quantity: coffinAssignment.coffin_quantity,
          supplier: coffinAssignment.coffin_supplier,
          origin: coffinAssignment.coffin_origin,
          category: coffinAssignment.coffin_category,
          images: coffinImages,
          primary_image: coffinImages[0] || null,
          notes: coffinAssignment.coffin_notes,
          assignment_date: coffinAssignment.assigned_date || coffinAssignment.created_at,
        }
      : null;

    /** Notifications */
    const notifications = [];
    const pushNotif = (type, status, message) => notifications.push({ type, status, message });

    deceased.is_embalmed
      ? pushNotif("embalmed", "success", "🧼 Embalming done.")
      : pushNotif("not_embalmed", "warning", "⚠️ Embalming not done yet.");

    nextOfKinRows.length
      ? pushNotif("next_of_kin", "success", "👤 Next of kin recorded.")
      : pushNotif("no_next_of_kin", "error", "❗ No next of kin recorded.");

    postRows[0]
      ? pushNotif("postmortem", "info", "🩺 Postmortem report exists.")
      : pushNotif("no_postmortem", "info", "ℹ️ No postmortem report.");

    if (dispatchRows.length) pushNotif("dispatch", "info", "🚚 Dispatch record exists.");
    if (coffinData) pushNotif("coffin", "success", `⚰️ Coffin assigned: ${coffinData.type}`);

    documentsRows.length
      ? pushNotif("documents", "success", `📄 ${documentsRows.length} documents uploaded.`)
      : pushNotif("no_documents", "warning", "❗ No documents uploaded.");

    /** FINAL RESPONSE */
    const responseData = {
      ...deceased,
      next_of_kin: nextOfKinRows,
      dispatch: dispatchRows[0] || null,
      charges: chargesRows,
      extra_charges: extraChargesRows,
      payments: paymentsRows,
      visitors: visitorsRows,
      documents: documentsRows,
      postmortem: postRows[0] || null,
      coffin_assignment: coffinData,

      financial_details: {
        billing,
        other_charges: otherCharges,
        extra_charges: extraCharges,
        total_charges: totalCharges,
        total_payments: totalPayments,
        balance,
        currency: deceased.currency || "KES",
      },

      cold_room_info: {
        room_no: deceased.cold_room_no || null,
        tray_no: deceased.tray_no || null,
      },
    };

    /** Cache */
    try {
      setDeceasedCached(id, { data: responseData, notifications });
      isCached = true;
    } catch {}

    return res.status(200).json({
      message: "✅ Full deceased record fetched successfully",
      data: responseData,
      notifications,
      cached: isCached,
    });
  } catch (err) {
    console.error("❌ Fatal error:", err);
    logError(err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});



// ----------------- Update Coffin Status -----------------
const updateCoffinStatus = asyncHandler(async (req, res) => {
  const { deceased_id } = req.query;
  const { coffin_status } = req.body;

  if (!deceased_id || !coffin_status)
    return res
      .status(400)
      .json({ message: 'Missing required fields', success: false });

  try {
    await safeQuery(
      'UPDATE deceased SET coffin_status = ? WHERE deceased_id = ?',
      [coffin_status, deceased_id],
    );
    res
      .status(200)
      .json({ message: 'Coffin status updated successfully', success: true });
  } catch (err) {
    console.error('Error updating coffin status:', err);
    logError(err);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
});

// ----------------- Update Dispatch Date -----------------
const updateDeceasedDispatchDate = asyncHandler(async (req, res) => {
  const deceased_id = req.body.deceased_id || req.query.deceased_id;
  const dispatch_date = req.body.dispatch_date;

  if (!deceased_id || !dispatch_date)
    return res
      .status(400)
      .json({ message: 'Missing required fields', success: false });

  try {
    await safeQuery(
      'UPDATE deceased SET dispatch_date = ? WHERE deceased_id = ?',
      [dispatch_date, deceased_id],
    );
    res
      .status(200)
      .json({ message: 'Dispatch date updated successfully', success: true });
  } catch (err) {
    console.error(' Error updating dispatch date:', err);
    logError(err);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
});

// ----------------- Update Deceased Status -----------------
function updateDeceasedStatus(cid, status, callback) {
  safeQuery(`UPDATE deceased_status_log SET status = ? WHERE cid = ?`, [
    status,
    cid,
  ])
    .then(() =>
      callback({ success: true, message: 'Status updated successfully' }),
    )
    .catch((err) => {
      console.error(' DB Error:', err.message);
      logError(err);
      callback({ success: false, message: 'Database update failed' });
    });
}

// ----------------- Update Global Mortuary Rate -----------------
function updateMortuaryRateForAll(newRate) {
  safeQuery(`UPDATE deceased SET mortuary_charge = ?`, [newRate])
    .then(() =>
      console.log(
        `✅ Updated mortuary charge for all records to KES ${newRate}`,
      ),
    )
    .catch((err) => {
      console.error(`Error updating global mortuary rate:`, err.message);
      logError(err);
    });
}

// ----------------- Update Deceased Record -----------------

// ----------------- Update Deceased Record -----------------
const updateDeceasedRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Deceased ID is required',
    });
  }

  try {
    const {
      full_name,
      gender,
      date_of_birth,
      date_of_death,
      cause_of_death,
      place_of_death,
      admission_number,
      mortuary_id,
      date_admitted,
      dispatch_date,
      county,
      location,
      status,
      total_mortuary_charge,
    } = req.body;

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];

    // Helper to add field to update
    const addField = (field, value) => {
      if (value !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(value);
      }
    };

    // Add fields to update
    addField('full_name', full_name);
    addField('gender', gender);
    addField('date_of_birth', date_of_birth);
    addField('date_of_death', date_of_death);
    addField('cause_of_death', cause_of_death);
    addField('place_of_death', place_of_death);
    addField('admission_number', admission_number);
    addField('mortuary_id', mortuary_id);
    addField('date_admitted', date_admitted);
    addField('dispatch_date', dispatch_date);
    addField('county', county);
    addField('location', location);
    addField('status', status);
    addField('total_mortuary_charge', total_mortuary_charge);

    // Add last_charge_update if financial fields are being updated
    if (total_mortuary_charge !== undefined) {
      addField('last_charge_update', new Date().toISOString());
    }

    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update',
      });
    }

    // Add deceased_id to values array
    updateValues.push(id);

    const updateQuery = `
      UPDATE deceased 
      SET ${updateFields.join(', ')}
      WHERE deceased_id = ? OR id = ?
    `;

    // Add id again for the OR condition
    updateValues.push(id);

    const result = await safeQuery(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deceased record not found',
      });
    }

    // Clear cache for this record
    deleteDeceasedCached(id);
    cache.del(ALL_DECEASED_CACHE_KEY);

    // Fetch updated record
    const updatedRecord = await safeQuery(
      `
      SELECT d.*, 
             u.name AS registered_by_name,
             u.username AS registered_by_username,
             u.role AS registered_by_role
      FROM deceased d
      LEFT JOIN users u ON d.registered_by_user_id = u.id
      WHERE d.deceased_id = ? OR d.id = ?
    `,
      [id, id],
    );

    res.status(200).json({
      success: true,
      message: 'Deceased record updated successfully',
      data: updatedRecord[0] || null,
    });
  } catch (err) {
    console.error('❌ Error updating deceased record:', err);
    logError(err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message,
    });
  }
});

const exportDeceasedToExcel = asyncHandler(async (req, res) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;

    // Calculate date ranges based on period
    let dateCondition = '';
    let dateParams = [];
    let periodLabel = '';

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    switch (period) {
      case 'month':
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        dateCondition = 'WHERE d.date_registered BETWEEN ? AND ?';
        dateParams = [monthStart, monthEnd];
        periodLabel = `${monthStart.toLocaleString('default', { month: 'long' })} ${currentYear}`;
        break;

      case 'quarter':
        const quarterStart = new Date(currentYear, currentQuarter * 3, 1);
        const quarterEnd = new Date(currentYear, currentQuarter * 3 + 3, 0);
        dateCondition = 'WHERE d.date_registered BETWEEN ? AND ?';
        dateParams = [quarterStart, quarterEnd];
        const quarters = ['First', 'Second', 'Third', 'Fourth'];
        periodLabel = `${quarters[currentQuarter]} Quarter ${currentYear}`;
        break;

      case 'half_year':
        const halfYear = currentMonth < 6 ? 0 : 6;
        const halfYearStart = new Date(currentYear, halfYear, 1);
        const halfYearEnd = new Date(currentYear, halfYear + 6, 0);
        dateCondition = 'WHERE d.date_registered BETWEEN ? AND ?';
        dateParams = [halfYearStart, halfYearEnd];
        periodLabel = `${halfYear === 0 ? 'First' : 'Second'} Half ${currentYear}`;
        break;

      case 'year':
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        dateCondition = 'WHERE d.date_registered BETWEEN ? AND ?';
        dateParams = [yearStart, yearEnd];
        periodLabel = `Year ${currentYear}`;
        break;

      case 'custom':
        if (startDate && endDate) {
          dateCondition = 'WHERE d.date_registered BETWEEN ? AND ?';
          dateParams = [new Date(startDate), new Date(endDate)];
          periodLabel = `Custom: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
        }
        break;

      default: // 'all'
        dateCondition = '';
        periodLabel = 'All Records';
    }

    // Get deceased records with proper extra charges aggregation
    const deceasedQuery = `
      SELECT 
        d.id,
        d.deceased_id,
        d.admission_number,
        d.full_name,
        d.gender,
        d.date_of_birth,
        d.date_of_death,
        d.date_registered,
        d.date_admitted,
        d.cause_of_death,
        d.place_of_death,
        d.county,
        d.location,
        d.status,
        d.coffin_status,
        d.dispatch_date,
        d.mortuary_charge,
        d.total_mortuary_charge,
        d.currency,
        d.burial_type,
        d.cold_room_no,
        d.tray_no,
        d.is_embalmed,
        d.embalmed_at,
        d.embalmed_by,
        d.embalming_cost,
        d.has_certificate,
        d.national_id,
        d.rate_category,
        d.branch_id,
        u.name as registered_by,
        dc.rfid as coffin_rfid,
        c.type as coffin_type,
        c.material as coffin_material,
        (
          SELECT COALESCE(SUM(ec.amount), 0) 
          FROM extra_charges ec 
          WHERE ec.deceased_id = d.deceased_id
          AND ec.status != 'Cancelled'
        ) as extra_charges_amount,
        (
          SELECT COUNT(ec.id)
          FROM extra_charges ec 
          WHERE ec.deceased_id = d.deceased_id
          AND ec.status != 'Cancelled'
        ) as extra_charges_count,
        (
          SELECT COUNT(DISTINCT nk.id)
          FROM next_of_kin nk 
          WHERE nk.deceased_id = d.deceased_id
        ) as next_of_kin_count,
        (
          SELECT COUNT(DISTINCT v.visitor_id)
          FROM visitors v 
          WHERE v.deceased_id = d.deceased_id
        ) as visitor_count
      FROM deceased d
      LEFT JOIN users u ON d.registered_by_user_id = u.id
      LEFT JOIN deceased_coffin dc ON d.deceased_id = dc.deceased_id
      LEFT JOIN coffins c ON dc.coffin_id = c.coffin_id
      ${dateCondition}
      ORDER BY d.date_registered DESC
      LIMIT 10000
    `;

    const deceased = await safeQuery(deceasedQuery, dateParams);

    // Get detailed extra charges
    const extraChargesDetailsQuery = `
      SELECT 
        ec.deceased_id,
        ec.charge_type,
        ec.amount,
        ec.description,
        ec.service_date,
        ec.status,
        ec.created_at
      FROM extra_charges ec
      WHERE ec.status != 'Cancelled'
      ${dateCondition ? `AND ec.deceased_id IN (SELECT deceased_id FROM deceased ${dateCondition})` : ''}
      ORDER BY ec.deceased_id, ec.service_date DESC
    `;

    const extraChargesDetails = await safeQuery(
      extraChargesDetailsQuery,
      dateParams,
    );

    // Get visitor statistics
    let visitorQuery = `
      SELECT 
        COUNT(*) as total_visitors,
        COUNT(DISTINCT deceased_id) as deceased_with_visitors,
        AVG(TIMESTAMPDIFF(HOUR, check_in_time, COALESCE(check_out_time, NOW()))) as avg_visit_duration_hours,
        visitor_type,
        COUNT(*) as count_by_type
      FROM visitors 
      WHERE 1=1
    `;

    let visitorParams = [];
    if (dateCondition) {
      visitorQuery += ` AND check_in_time BETWEEN ? AND ?`;
      visitorParams = [...dateParams];
    }
    visitorQuery += ` GROUP BY visitor_type`;

    const visitorStats = await safeQuery(visitorQuery, visitorParams);

    // Get next of kin statistics
    let nextOfKinQuery = `
      SELECT 
        COUNT(*) as total_next_of_kin,
        COUNT(DISTINCT deceased_id) as deceased_with_next_of_kin,
        relationship,
        COUNT(*) as count_by_relationship
      FROM next_of_kin 
      WHERE 1=1
    `;

    let nextOfKinParams = [];
    if (dateCondition) {
      nextOfKinQuery += ` AND created_at BETWEEN ? AND ?`;
      nextOfKinParams = [...dateParams];
    }
    nextOfKinQuery += ` GROUP BY relationship ORDER BY count_by_relationship DESC LIMIT 10`;

    const nextOfKinStats = await safeQuery(nextOfKinQuery, nextOfKinParams);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Lee Funeral Home - MMS';
    workbook.lastModifiedBy = 'Lee Funeral Home Management System';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet('Deceased Records', {
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.4,
          right: 0.4,
          top: 0.6,
          bottom: 0.6,
          header: 0.4,
          footer: 0.4,
        },
      },
      views: [{ state: 'normal', zoomScale: 85 }],
      properties: { showGridLines: true },
    });

    // calculations 
    const totalRecords = deceased.length;
    const totalBaseCharges = deceased.reduce(
      (sum, d) => sum + parseFloat(d.total_mortuary_charge || 0),
      0,
    );
    const totalExtraCharges = deceased.reduce(
      (sum, d) => sum + parseFloat(d.extra_charges_amount || 0),
      0,
    );
    const totalCharges = totalBaseCharges + totalExtraCharges;

    const embalmedCount = deceased.filter((d) => d.is_embalmed).length;
    const dispatchedCount = deceased.filter((d) => d.dispatch_date).length;
    const withCertificates = deceased.filter((d) => d.has_certificate).length;
    const withCoffins = deceased.filter(
      (d) => d.coffin_status && d.coffin_status !== 'Not Assigned',
    ).length;
    const withExtraCharges = deceased.filter(
      (d) => d.extra_charges_count > 0,
    ).length;
    const withNextOfKin = deceased.filter(
      (d) => d.next_of_kin_count > 0,
    ).length;
    const withVisitors = deceased.filter((d) => d.visitor_count > 0).length;

    // Age statistics
    const ages = deceased
      .map((d) => {
        if (d.date_of_birth && d.date_of_death) {
          const birth = new Date(d.date_of_birth);
          const death = new Date(d.date_of_death);
          return Math.floor((death - birth) / (365.25 * 24 * 60 * 60 * 1000));
        }
        return null;
      })
      .filter((age) => age !== null);

    const averageAge =
      ages.length > 0
        ? Math.round(ages.reduce((a, b) => a + b) / ages.length)
        : 0;

    const generationTimestamp = new Date();
    const formattedTimestamp =
      generationTimestamp.toISOString().replace(/[:.]/g, '-').split('T')[0] +
      '_' +
      generationTimestamp.toTimeString().split(' ')[0].replace(/:/g, '-');

    // Helper function to convert hex color to Excel format
    const hexToExcelColor = (hexColor) => {
      return hexColor.replace('#', 'FF');
    };

    // header    section  

    // Main Title Row
    const mainTitleRow = worksheet.addRow([]);
    worksheet.mergeCells(`A${mainTitleRow.number}:U${mainTitleRow.number}`);
    mainTitleRow.height = 45;

    mainTitleRow.getCell(1).value =
      '🏛️  LEE FUNERAL HOME MANAGEMENT SYSTEM  |  DECEASED RECORDS  REPORT';
    mainTitleRow.getCell(1).font = {
      name: 'Arial',
      size: 20,
      bold: true,
      color: { argb: hexToExcelColor(Colors.cssVars.white) },
    };
    mainTitleRow.getCell(1).fill = {
      type: 'gradient',
      gradient: 'angle',
      degree: 0,
      stops: [
        { position: 0, color: { argb: hexToExcelColor(Colors.primaryDark) } },
        { position: 0.5, color: { argb: hexToExcelColor(Colors.darkGray) } },
        { position: 1, color: { argb: hexToExcelColor(Colors.primaryDark) } },
      ],
    };
    mainTitleRow.getCell(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    mainTitleRow.getCell(1).border = {
      bottom: {
        style: 'medium',
        color: { argb: hexToExcelColor(Colors.accentRed) },
      },
    };

    // Analytics Header
    const analyticsHeader = worksheet.addRow([]);
    worksheet.mergeCells(
      `A${analyticsHeader.number}:U${analyticsHeader.number}`,
    );
    analyticsHeader.height = 32;

    analyticsHeader.getCell(1).value =
      `📊  BUSINESS DATA  |  PERIOD: ${periodLabel.toUpperCase()}  |  Generated: ${generationTimestamp.toLocaleString()}`;
    analyticsHeader.getCell(1).font = {
      name: 'Arial',
      size: 14,
      bold: true,
      color: { argb: hexToExcelColor(Colors.cssVars.white) },
    };
    analyticsHeader.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: hexToExcelColor(Colors.cssVars.gray700) },
    };
    analyticsHeader.getCell(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    worksheet.addRow([]);

    // summary  section  

    // Financial Summary Row
    const financialSummary = worksheet.addRow([]);
    financialSummary.height = 42;

    const financialStats = [
      {
        label: 'TOTAL REVENUE',
        value: `Ksh ${totalCharges.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        sublabel: `Base: Ksh ${totalBaseCharges.toLocaleString()} | Extra: Ksh ${totalExtraCharges.toLocaleString()}`,
        color: Colors.successGreen,
        bgColor: Colors.cssVars.gray100,
      },
      {
        label: 'RECORDS ANALYZED',
        value: totalRecords.toLocaleString(),
        sublabel: `Active: ${deceased.filter((d) => d.status === 'Active').length} | Dispatched: ${dispatchedCount}`,
        color: Colors.infoBlue,
        bgColor: Colors.cssVars.gray100,
      },
      {
        label: 'EXTRA CHARGES',
        value: `${withExtraCharges}/${totalRecords}`,
        sublabel: `Total: Ksh ${totalExtraCharges.toLocaleString()} | Services: ${extraChargesDetails.length}`,
        color: Colors.warningYellow,
        bgColor: Colors.cssVars.gray100,
      },
      {
        label: 'VISITOR ANALYTICS',
        value: `${visitorStats[0]?.total_visitors || 0} Visitors`,
        sublabel: `Avg Duration: ${Math.round(visitorStats[0]?.avg_visit_duration_hours || 0)}h`,
        color: Colors.cssVars.purple,
        bgColor: Colors.cssVars.gray100,
      },
    ];

    financialStats.forEach((stat, index) => {
      const startCol = index * 5 + 1;
      const endCol = startCol + 4;

      if (endCol <= 21) {
        worksheet.mergeCells(
          `${String.fromCharCode(64 + startCol)}${financialSummary.number}:${String.fromCharCode(64 + endCol)}${financialSummary.number}`,
        );

        const cell = financialSummary.getCell(startCol);
        cell.value = `${stat.label}\n${stat.value}\n${stat.sublabel}`;
        cell.font = {
          name: 'Arial',
          size: 10,
          bold: true,
          color: { argb: hexToExcelColor(stat.color) },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: hexToExcelColor(stat.bgColor) },
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true,
        };
        cell.border = {
          top: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
          left: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
          bottom: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
          right: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
        };
      }
    });

    worksheet.addRow([]);

    // Detailed Analytics Row
    const detailedAnalytics = worksheet.addRow([]);
    detailedAnalytics.height = 38;

    const analyticsStats = [
      {
        label: 'NEXT OF KIN',
        value: `${withNextOfKin}/${totalRecords}`,
        details: `${nextOfKinStats[0]?.total_next_of_kin || 0} Total Contacts`,
        color: Colors.cssVars.teal,
        bgColor: Colors.cssVars.gray200,
      },
      {
        label: 'AGE ANALYSIS',
        value: `${averageAge} yrs Avg`,
        details: `Range: ${ages.length > 0 ? Math.min(...ages) : 0}-${ages.length > 0 ? Math.max(...ages) : 0} years`,
        color: Colors.cssVars.orange,
        bgColor: Colors.cssVars.gray200,
      },
      {
        label: 'BURIAL TYPES',
        value: `${deceased.filter((d) => d.burial_type === 'Burial').length} Burial`,
        details: `${deceased.filter((d) => d.burial_type === 'Cremation').length} Cremation`,
        color: Colors.cssVars.grayDark,
        bgColor: Colors.cssVars.gray200,
      },
      {
        label: 'CERTIFICATES',
        value: `${withCertificates}/${totalRecords}`,
        details: `${((withCertificates / totalRecords) * 100).toFixed(1)}% Completion`,
        color: Colors.accentBlue,
        bgColor: Colors.cssVars.gray200,
      },
      {
        label: 'SERVICES',
        value: `${embalmedCount} Embalmed`,
        details: `${withCoffins} Coffins | ${withExtraCharges} Extra Services`,
        color: Colors.cssVars.pink,
        bgColor: Colors.cssVars.gray200,
      },
    ];

    analyticsStats.forEach((stat, index) => {
      const startCol = index * 4 + 1;
      const endCol = startCol + 3;

      if (endCol <= 21) {
        worksheet.mergeCells(
          `${String.fromCharCode(64 + startCol)}${detailedAnalytics.number}:${String.fromCharCode(64 + endCol)}${detailedAnalytics.number}`,
        );

        const cell = detailedAnalytics.getCell(startCol);
        cell.value = `${stat.label}\n${stat.value}\n${stat.details}`;
        cell.font = {
          name: 'Arial',
          size: 9,
          bold: true,
          color: { argb: hexToExcelColor(stat.color) },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: hexToExcelColor(stat.bgColor) },
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true,
        };
        cell.border = {
          top: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
          left: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
          bottom: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
          right: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
        };
      }
    });

    worksheet.addRow([]);
    worksheet.addRow([]);

    // data  table  headers  
    const headers = [
      'SYS ID',
      'DECEASED ID',
      'ADMISSION NO',
      'FULL NAME',
      'GENDER',
      'DATE OF BIRTH',
      'DATE OF DEATH',
      'DATE REGISTERED',
      'AGE',
      'CAUSE OF DEATH',
      'PLACE OF DEATH',
      'COUNTY',
      'STATUS',
      'COFFIN STATUS',
      'DISPATCH DATE',
      'BASE CHARGES',
      'EXTRA CHARGES',
      'TOTAL CHARGES',
      'CURRENCY',
      'BURIAL TYPE',
      'EMBALMED',
      'EXTRA SERVICES',
      'VISITORS',
      'NEXT OF KIN',
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: hexToExcelColor(Colors.cssVars.white) },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: hexToExcelColor(Colors.primaryDark) },
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = {
        top: {
          style: 'medium',
          color: { argb: hexToExcelColor(Colors.accentRed) },
        },
        left: {
          style: 'thin',
          color: { argb: hexToExcelColor(Colors.borderColor) },
        },
        bottom: {
          style: 'medium',
          color: { argb: hexToExcelColor(Colors.accentRed) },
        },
        right: {
          style: 'thin',
          color: { argb: hexToExcelColor(Colors.borderColor) },
        },
      };
    });

    // data  rows 
    deceased.forEach((record, index) => {
      // Calculate age
      Logger.info(`Computing   age` , {actions:  "age computations"});
      let age = 'N/A';
      if (record.date_of_birth && record.date_of_death) {
        const birth = new Date(record.date_of_birth);
        const death = new Date(record.date_of_death);
        age =
          Math.floor((death - birth) / (365.25 * 24 * 60 * 60 * 1000)) + ' yrs';
      }
      Logger.info(`Calculate total charges including extra charges` , {actions:  "charge computations"});
      const baseCharge = parseFloat(record.total_mortuary_charge || 0);
      const extraCharges = parseFloat(record.extra_charges_amount || 0);
      const totalCharges = baseCharge + extraCharges;
      // Get detailed extra charges for this record
      Logger.info(`Get detailed extra charges for this record ` , {actions:  "fetch"});
      const recordExtraCharges = extraChargesDetails.filter(
        (ec) => ec.deceased_id === record.deceased_id,
      );
      const extraChargesDetail =
        recordExtraCharges.length > 0
          ? `${recordExtraCharges.length} services (Ksh ${extraCharges.toLocaleString()})`
          : 'None';
      Logger.info(`Organizing  Woorksheet  ` , {actions:  "worksheet"});
      const row = worksheet.addRow([
        record.id,
        record.deceased_id,
        record.admission_number || 'N/A',
        record.full_name,
        record.gender || 'N/A',
        record.date_of_birth
          ? new Date(record.date_of_birth).toLocaleDateString()
          : 'N/A',
        record.date_of_death
          ? new Date(record.date_of_death).toLocaleDateString()
          : 'N/A',
        record.date_registered
          ? new Date(record.date_registered).toLocaleString()
          : 'N/A',
        age,
        record.cause_of_death || 'N/A',
        record.place_of_death || 'N/A',
        record.county || 'N/A',
        record.status || 'N/A',
        record.coffin_status || 'Not Assigned',
        record.dispatch_date
          ? new Date(record.dispatch_date).toLocaleDateString()
          : 'Not Dispatched',
        baseCharge.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        extraCharges.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        totalCharges.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        record.currency || 'KES',
        record.burial_type || 'Burial',
        record.is_embalmed ? 'Yes' : 'No',
        extraChargesDetail,
        record.visitor_count > 0 ? `${record.visitor_count} visitors` : 'None',
        record.next_of_kin_count > 0
          ? `${record.next_of_kin_count} contacts`
          : 'None',
      ]);

      row.height = 24;

      // Determine background color based on row and status
      const hasExtraCharges = record.extra_charges_count > 0;
      let rowBgColor =
        index % 2 === 0 ? Colors.cssVars.white : Colors.cssVars.gray100;

      if (hasExtraCharges) {
        rowBgColor = Colors.cssVars.warning + '20'; // Light yellow with transparency
      }
      if (record.status === 'Dispatched') {
        rowBgColor = Colors.successGreen + '15'; // Light green for dispatched
      }

      row.eachCell((cell, colNumber) => {
        // Base cell styling
        cell.font = {
          name: 'Arial',
          size: 9,
          color: { argb: hexToExcelColor(Colors.cssVars.gray900) },
        };
        cell.border = {
          top: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
          left: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
          bottom: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
          right: {
            style: 'thin',
            color: { argb: hexToExcelColor(Colors.borderColor) },
          },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
        };

        // Apply background color
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: hexToExcelColor(rowBgColor) },
        };

        // Enhanced column styling for better visibility
        switch (colNumber) {
          case 1: // SYS ID
            cell.font.bold = true;
            cell.font.color = { argb: hexToExcelColor(Colors.primaryDark) };
            cell.alignment = { horizontal: 'center' };
            break;

          case 4: // Full Name
            cell.font.bold = true;
            cell.font.size = 10;
            break;

          case 9: // Age
            cell.alignment = { horizontal: 'center' };
            cell.font.bold = true;
            break;

          case 13: // Status
            cell.alignment = { horizontal: 'center' };
            if (record.status === 'Active') {
              cell.font.color = { argb: hexToExcelColor(Colors.successGreen) };
            } else if (record.status === 'Dispatched') {
              cell.font.color = { argb: hexToExcelColor(Colors.infoBlue) };
            }
            break;

          case 16: // Base Charges
          case 17: // Extra Charges
          case 18: // Total Charges
            cell.alignment = { horizontal: 'right' };
            cell.font.bold = true;
            cell.font.size = 9;
            break;

          case 16: // Base Charges
            cell.font.color = { argb: hexToExcelColor(Colors.accentBlue) };
            break;

          case 17: // Extra Charges
            cell.font.color = { argb: hexToExcelColor(Colors.warningYellow) };
            break;

          case 18: // Total Charges
            cell.font.color = { argb: hexToExcelColor(Colors.successGreen) };
            break;

          case 21: // Extra Services
            cell.alignment = { horizontal: 'center' };
            if (hasExtraCharges) {
              cell.font.bold = true;
              cell.font.color = { argb: hexToExcelColor(Colors.warningYellow) };
            }
            break;
        }
      });
    });

    // worksheet columns  
    worksheet.columns = [
      { width: 10 }, // Sys  id
      { width: 18 }, // deceased  id
      { width: 14 }, // adm  no
      { width: 25 }, // f.name
      { width: 10 }, // gender
      { width: 14 }, // DOB
      { width: 14 }, // DOD
      { width: 18 }, // DAte Regestired
      { width: 10 }, //   syy  cal  age
      { width: 20 }, // cause  of  death
      { width: 18 }, // Place of  death
      { width: 14 }, // County
      { width: 12 }, // current  status (   received  , peding , complted)
      { width: 14 }, // Coffin status
      { width: 14 }, // set  dispatch  
      { width: 14 }, // mortuary base  charges
      { width: 14 }, // ''     extra  charges
      { width: 14 }, // total  charges
      { width: 10 }, // base  currency 
      { width: 12 }, // Burial  type (   cremenation ,   burial )
      { width: 12 }, // emablming 
      { width: 28 }, // extra  services
      { width: 14 }, // visitors  count
      { width: 16 }, // next  of kins  
    ];

     //   foote r section  
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Final Summary
    const finalSummaryRow = worksheet.addRow([]);
    finalSummaryRow.height = 32;

    finalSummaryRow.getCell(1).value =
      `BUSINESS SUMMARY  |  Records: ${totalRecords.toLocaleString()}  |  Revenue: Ksh ${totalCharges.toLocaleString('en-US', { minimumFractionDigits: 2 })}  |  Extra Charges: Ksh ${totalExtraCharges.toLocaleString()}  |  Visitors: ${visitorStats[0]?.total_visitors || 0}`;
    finalSummaryRow.getCell(1).font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: hexToExcelColor(Colors.cssVars.white) },
    };
    finalSummaryRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: hexToExcelColor(Colors.cssVars.gray800) },
    };
    finalSummaryRow.getCell(1).alignment = {
      horizontal: 'left',
      vertical: 'middle',
    };
    worksheet.mergeCells(
      `A${finalSummaryRow.number}:U${finalSummaryRow.number}`,
    );

    // Footer Information
    const footerInfoRow = worksheet.addRow([]);
    worksheet.mergeCells(`A${footerInfoRow.number}:U${footerInfoRow.number}`);

    footerInfoRow.getCell(1).value =
      `SYSTEM GENERATED REPORT - DO NOT EDIT :  Business  Data |  Lee Funeral Home Management System  |  Period: ${periodLabel}  |  Generated: ${generationTimestamp.toLocaleString()}`;
    footerInfoRow.getCell(1).font = {
      name: 'Arial',
      size: 9,
      color: { argb: hexToExcelColor(Colors.textMuted) },
    };
    footerInfoRow.getCell(1).alignment = {
      horizontal: 'left',
    };

    const copyrightRow = worksheet.addRow([]);
    worksheet.mergeCells(`A${copyrightRow.number}:U${copyrightRow.number}`);

    copyrightRow.getCell(1).value =
      `© ${generationTimestamp.getFullYear()} Lee Funeral Home. CONFIDENTIAL MEDICAL & BUSINESS DATA - Authorized personnel only. | TIMESTAMP: ${generationTimestamp.toISOString()}`;
    copyrightRow.getCell(1).font = {
      name: 'Arial',
      size: 8,
      italic: true,
      color: { argb: hexToExcelColor(Colors.textMuted) },
    };
    copyrightRow.getCell(1).alignment = {
      horizontal: 'left',
    };
    //   send   Exel     Sheet
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Montezuma  Monalisa-Funeral-Analytics-${period}-${formattedTimestamp}.xlsx"`,
    );
    res.setHeader('Content-Length', buffer.length);

    Logger.info(`Sending  Buffer  Context`, {
      action: "Buffering Exel Sheet"
    });

    res.send(buffer);
  } catch (error) {

    Logger.error(`Erro Exporting deceased  Records  to Exel  ` , {
      error: error,
      stack:   error.stack,
      module:  "export-Exel",
      action:  "Export  to Exel  Failed"

    });

    res.status(500).json({
      success: false,
      message: 'Failed to export deceased records to Excel'
    });
  }
});

//  Exports
module.exports = {
  registerDeceased,
  getAllRegisteredDeceased,
  getDeceasedById,
  updateCoffinStatus,
  updateDeceasedDispatchDate,
  updateDeceasedStatus,
  updateMortuaryRateForAll,
  updateDeceasedRecord,
  exportDeceasedToExcel,
};
