const axios = require('axios');

class FasreachService {
  constructor() {
    this.apiKey = process.env.FASREACH_API_KEY || 'bms_live_1785502841008_np14a00zkx';
    this.senderId = process.env.FASREACH_SENDER_ID || 'JNJVINTAGE';
    this.baseURL = 'https://fasreach.com/api/sms/send';
  }

  getCredentials() {
    try {
      const adminController = require('../controllers/adminController');
      if (adminController.storeSettings && adminController.storeSettings.fasreachApiKey) {
        return {
          apiKey: adminController.storeSettings.fasreachApiKey || this.apiKey,
          senderId: adminController.storeSettings.fasreachSenderId || this.senderId || 'JNJVINTAGE',
        };
      }
    } catch (e) {}
    return { apiKey: this.apiKey, senderId: this.senderId };
  }

  async sendSMS(recipientOrOptions, msgText) {
    let recipient = '';
    let message = '';
    let customSender = '';

    if (typeof recipientOrOptions === 'object' && recipientOrOptions !== null) {
      recipient = recipientOrOptions.recipient || recipientOrOptions.to || recipientOrOptions.phone || '';
      message = recipientOrOptions.message || msgText || '';
      customSender = recipientOrOptions.sender || '';
    } else {
      recipient = recipientOrOptions || '';
      message = msgText || '';
    }

    const { apiKey, senderId } = this.getCredentials();
    const finalSender = customSender || senderId || 'JNJVINTAGE';
    const cleanPhone = (recipient || '').toString().replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      console.warn('[FastReach SMS Warning] Empty recipient phone number');
      return { success: false, message: 'No phone number provided' };
    }

    try {
      console.log(`[FastReach SMS Dispatch] To: ${cleanPhone} | Sender: ${finalSender}`);
      
      const response = await axios.post(
        this.baseURL,
        {
          recipient: cleanPhone,
          to: cleanPhone,
          phone: cleanPhone,
          message: message,
          content: message,
          text: message,
          sender: finalSender,
          senderId: finalSender,
          sender_id: finalSender,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('[FastReach SMS Success]', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[FastReach SMS Error]', error.response?.data || error.message);
      
      // Fallback try with default FASREACH sender if custom sender ID failed
      if (finalSender !== 'FASREACH') {
        try {
          console.log(`[FastReach SMS Retry] Trying FASREACH fallback sender...`);
          const retryRes = await axios.post(
            this.baseURL,
            {
              recipient: cleanPhone,
              to: cleanPhone,
              message: message,
              sender: 'FASREACH',
            },
            {
              headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            }
          );
          console.log('[FastReach SMS Retry Success]', retryRes.data);
          return { success: true, data: retryRes.data };
        } catch (retryErr) {
          console.error('[FastReach SMS Retry Error]', retryErr.response?.data || retryErr.message);
        }
      }

      return { success: false, error: error.response?.data || error.message };
    }
  }

  // 1. 🛍️ Order Received
  async sendOrderReceived(phone, customerName, orderID, amount) {
    const msg = `🛍️ Order Received\n\nJNJ Vintage\n\nHi ${customerName || 'Valued Customer'}, thank you for shopping with us! Your order has been received successfully.\n\nOrder ID: #${orderID}\nAmount: GH₵${Number(amount).toLocaleString()}\n\nWe'll notify you as your order progresses.`;
    return this.sendSMS(phone, msg);
  }

  // 2. 💳 Payment Successful
  async sendPaymentSuccessful(phone, orderID) {
    const msg = `💳 Payment Successful\n\nJNJ Vintage\n\nYour payment for Order #${orderID} has been confirmed successfully.\n\nWe're now preparing your order for shipment.`;
    return this.sendSMS(phone, msg);
  }

  // 3. 📦 Order Processing
  async sendOrderProcessing(phone, orderID) {
    const msg = `📦 Order Processing\n\nJNJ Vintage\n\nGreat news! Your Order #${orderID} is now being processed and prepared for delivery.\n\nWe'll update you once it has been dispatched.`;
    return this.sendSMS(phone, msg);
  }

  // 4. 🚚 Order Dispatched
  async sendOrderDispatched(phone, orderID) {
    const msg = `🚚 Order Dispatched\n\nJNJ Vintage\n\nYour Order #${orderID} has been dispatched.\n\nYour package is on its way. Thank you for choosing JNJ Vintage!`;
    return this.sendSMS(phone, msg);
  }

  // 5. 🚛 Out for Delivery
  async sendOutForDelivery(phone, orderID) {
    const msg = `🚛 Out for Delivery\n\nJNJ Vintage\n\nYour Order #${orderID} is out for delivery today.\n\nPlease keep your phone available in case our delivery partner needs to reach you.`;
    return this.sendSMS(phone, msg);
  }

  // 6. ✅ Order Delivered
  async sendOrderDelivered(phone, orderID) {
    const msg = `✅ Order Delivered\n\nJNJ Vintage\n\nYour Order #${orderID} has been delivered successfully.\n\nThank you for choosing JNJ Vintage. We look forward to serving you again!`;
    return this.sendSMS(phone, msg);
  }

  // 7. ❌ Order Cancelled
  async sendOrderCancelled(phone, orderID) {
    const msg = `❌ Order Cancelled\n\nJNJ Vintage\n\nYour Order #${orderID} has been cancelled.\n\nIf you have any questions, please contact our support team.`;
    return this.sendSMS(phone, msg);
  }

  // 8. 💰 Refund Processed
  async sendRefundProcessed(phone, orderID) {
    const msg = `💰 Refund Processed\n\nJNJ Vintage\n\nYour refund for Order #${orderID} has been processed successfully.\n\nThank you for choosing JNJ Vintage.`;
    return this.sendSMS(phone, msg);
  }

  // 9. 📦 Cash on Delivery
  async sendCashOnDelivery(phone, orderID, amount) {
    const msg = `📦 Cash on Delivery\n\nJNJ Vintage\n\nYour Cash on Delivery order #${orderID} has been confirmed.\n\nPlease have GH₵${Number(amount).toLocaleString()} ready when your order arrives.`;
    return this.sendSMS(phone, msg);
  }

  // Legacy Wrapper method for Order Creation
  async sendOrderConfirmation(phone, invoiceNumber, amount, customerName = 'Valued Customer', paymentMethod = 'Paystack') {
    if (paymentMethod === 'CashOnDelivery') {
      return this.sendCashOnDelivery(phone, invoiceNumber, amount);
    }
    return this.sendOrderReceived(phone, customerName, invoiceNumber, amount);
  }

  // Legacy Wrapper method for Order Status Updates
  async sendOrderStatusUpdate(phone, invoiceNumber, status) {
    const st = (status || '').toLowerCase();
    if (st.includes('process')) return this.sendOrderProcessing(phone, invoiceNumber);
    if (st.includes('ship') || st.includes('dispatch')) return this.sendOrderDispatched(phone, invoiceNumber);
    if (st.includes('out') || st.includes('route')) return this.sendOutForDelivery(phone, invoiceNumber);
    if (st.includes('deliver')) return this.sendOrderDelivered(phone, invoiceNumber);
    if (st.includes('cancel')) return this.sendOrderCancelled(phone, invoiceNumber);
    if (st.includes('refund')) return this.sendRefundProcessed(phone, invoiceNumber);
    return this.sendOrderProcessing(phone, invoiceNumber);
  }
}

module.exports = new FasreachService();
