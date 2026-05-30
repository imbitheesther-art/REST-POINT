const express = require('express');
const router = express.Router();
const { assignColdRoom } = require('../coldroom-service/controllers/coldRoomController');

router.post('/assign/cold-room', assignColdRoom);

module.exports = router;
