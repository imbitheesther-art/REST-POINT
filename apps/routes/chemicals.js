const express = require("express");
const router = express.Router();
const {
  addChemical,      updateChemical,
  receiveChemical,
  useChemical,   analyticsSummary  ,
  getChemicalStock,
  transferChemical  ,  getAllChemicals , usageReport
} = require("../controllers/chemicals/chemicals"); // Adjust path accordingly

/* ===============================
   ✅ ROUTES
   =============================== */

// Add a new chemical
// POST /api/chemicals
router.post("/chemicals", addChemical);
router.get("/chemicals",  getAllChemicals );
router.put("/chemicals/:chemical_id"     ,    updateChemical);

router.get("/chemical-analytics/:branch_id", analyticsSummary );

router.get("/usage/:branch_id",  usageReport );

// Record chemical receipt
// POST /api/chemicals/receive
router.post("/chemicals/receive", receiveChemical);

// Record chemical usage during embalming
// POST /api/chemicals/use
router.post("/chemicals/use", useChemical);

// Get chemical stock for a branch
// GET /api/chemicals/stock/:branch_id
router.get("/chemicals/stock/:branch_id", getChemicalStock);

// Transfer chemicals between branches
// POST /api/chemicals/transfer
router.post("/chemicals/transfer", transferChemical);

module.exports = router;
