const express = require('express');
const router = express.Router();

const {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require('../controllers/notifications/notifications');

// Get all notifications
router.get('/notifications', getAllNotifications);

// Mark single notification as read
router.put('/notifications/:id/mark-read', markNotificationAsRead);

// Mark all notifications as read
router.put('/notifications/mark-all-read', markAllNotificationsAsRead);

// Delete a notification
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
