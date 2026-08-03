const paystackService = require('../services/paystackService');
const Order = require('../models/Order');
const { memoryOrders } = require('./orderController');
const fasreachService = require('../services/fasreachService');

// Track processed references to ensure idempotency and prevent duplicate verification
const processedReferences = new Set();

// @desc    Initialize Paystack Payment
// @route   POST /api/paystack/initialize
// @access  Public / Private
const initializePayment = async (req, res) => {
  try {
    const { orderId, email, amount, callback_url } = req.body;

    if (!amount || !email) {
      return res.status(400).json({ message: 'Amount and email are required' });
    }

    const reference = `LUX_PAY_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const paystackResponse = await paystackService.initializeTransaction({
      amount: Number(amount),
      email,
      reference,
      metadata: { orderId },
      callback_url: callback_url || `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success`,
    });

    res.json(paystackResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Paystack Payment
// @route   GET /api/paystack/verify/:reference
// @access  Public / Private
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    // Check duplicate payment verification idempotency
    if (processedReferences.has(reference)) {
      return res.json({
        status: true,
        message: 'Payment already verified previously',
        data: { reference, status: 'success', duplicateHandled: true },
      });
    }

    const verification = await paystackService.verifyTransaction(reference);

    if (verification && verification.data && verification.data.status === 'success') {
      processedReferences.add(reference);

      const orderId = req.query.orderId || verification.data.metadata?.orderId;

      if (Order.db && Order.db.readyState === 1 && orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            id: verification.data.id || reference,
            status: 'success',
            reference: reference,
            paidAt: verification.data.paid_at || new Date().toISOString(),
            channel: verification.data.channel || 'card',
          };
          order.orderStatus = 'Processing';
          await order.save();

          if (order.shippingAddress?.phone) {
            fasreachService.sendPaymentSuccessful(order.shippingAddress.phone, order.invoiceNumber);
          }
        }
      } else if (orderId) {
        const memOrder = memoryOrders.find((o) => o._id === orderId || o.invoiceNumber === orderId);
        if (memOrder) {
          memOrder.isPaid = true;
          memOrder.paidAt = new Date().toISOString();
          memOrder.orderStatus = 'Processing';
          memOrder.paymentResult = {
            id: reference,
            status: 'success',
            reference,
            paidAt: new Date().toISOString(),
            channel: 'card',
          };
        }
      }

      return res.json({
        status: true,
        message: 'Payment verified successfully',
        data: verification.data,
      });
    }

    res.status(400).json({
      status: false,
      message: verification?.message || 'Payment verification failed',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Paystack Webhook
// @route   POST /api/paystack/webhook
// @access  Public (Signature verification)
const paystackWebhook = async (req, res) => {
  try {
    // Return 200 OK immediately for Paystack webhook specification
    const event = req.body;
    if (event && event.event === 'charge.success') {
      const reference = event.data.reference;
      if (reference && !processedReferences.has(reference)) {
        processedReferences.add(reference);
        console.log(`[Paystack Webhook] Verified payment event for ref: ${reference}`);
      }
    }
    res.status(200).send('Webhook Received');
  } catch (error) {
    res.status(500).send('Webhook Error');
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  paystackWebhook,
};
