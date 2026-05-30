// routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const { 
  addToCollectionQueue, 
  getCollectionQueue,
  updateQueueStatus,    // Import the new function
  deleteQueueItem      // Import the new function
} = require('../controllers/TTS-Audio/collectionQueue');
const ttsGoogleAudio = require('../controllers/TTS-Audio/ttsAudio');

// Collection queue routes
router.post('/collection-queue', addToCollectionQueue);
router.get('/collection-queue', getCollectionQueue);
router.patch('/collection-queue/:id/status', updateQueueStatus);  // Add this route
router.delete('/collection-queue/:id', deleteQueueItem);         // Add this route

// TTS route
router.post('/tts/:id', ttsGoogleAudio);

module.exports = router;