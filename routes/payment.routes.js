const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment.controller');
const verifyToken = require('../middleware/verifyToken');

// Initialize payment
router.post('/initialize', verifyToken, paymentController.initializePayment);

// Verify payment
router.get('/verify', paymentController.verifyPayment);

// Webhook
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;