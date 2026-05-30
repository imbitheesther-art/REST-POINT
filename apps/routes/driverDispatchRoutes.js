const express = require('express');
const router = express.Router();
const {
  assignVehicleDispatch,
} = require('../hearse-service/src/controllers/drivers/assignDriverDispstch');

router.post('/dispatch', assignVehicleDispatch);

module.exports = router;
