const axios = require('axios');

class FasreachService {
  constructor() {
    this.apiKey = process.env.FASREACH_API_KEY || 'bms_live_1785502841008_np14a00zkx';
    this.senderId = process.env.FASREACH_SENDER_ID || 'FASREACH';
    this.baseURL = 'https://fasreach.com/api/sms/send';
  }

  getCredentials() {
    try {
      const adminController = require('../controllers/adminController');
      if (adminController.storeSettings && adminController.storeSettings.fasreachApiKey) {
        return {
          apiKey: adminController.storeSettings.fasreachApiKey || this.apiKey,
          senderId: adminController.storeSettings.fasreachSenderId || this.senderId || 'FASREACH',
        };
      }
    } catch (e) {}
    return { apiKey: this.apiKey, senderId: this.senderId };
  }

  async sendSMS(recipientOrOptions, msgText) {
    let recipient = '';
    let message = '';
    let customSender = '';

    // Handle both sendSMS(recipient, message) and sendSMS({ recipient, to, message, sender })
    if (typeof recipientOrOptions === 'object' && recipientOrOptions !== null) {
      recipient = recipientOrOptions.recipient || recipientOrOptions.to || recipientOrOptions.phone || '';
      message = recipientOrOptions.message || msgText || '';
      customSender = recipientOrOptions.sender || '';
    } else {
      recipient = recipientOrOptions || '';
      message = msgText || '';
    }

    const { apiKey, senderId } = this.getCredentials();
    const finalSender = customSender || senderId || 'FASREACH';
    const cleanPhone = (recipient || '').toString().replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      console.warn('[FastReach SMS Warning] Empty recipient phone number');
      return { success: false, message: 'No phone number provided' };
    }

    try {
      console.log(`[FastReach SMS Dispatch] To: ${cleanPhone} | Sender: ${finalSender} | API Key: ${apiKey.substring(0, 10)}...`);
      
      const response = await axios.post(
        this.baseURL,
        {
          to: cleanPhone,
          message: message,
          sender: finalSender,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('[FastReach SMS Delivered Success]', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[FastReach SMS Delivery Error]', error.response?.data || error.message);
      
      // Fallback try with default FASREACH sender if custom sender ID failed
      if (finalSender !== 'FASREACH') {
        try {
          console.log(`[FastReach SMS Retry] Trying default FASREACH sender ID...`);
          const retryRes = await axios.post(
            this.baseURL,
            {
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

  async sendOrderConfirmation(phone, invoiceNumber, amount) {
    const message = `J&J VINTAGE: Your order ${invoiceNumber} for GHc ${amount} has been received and is being processed for delivery. Thank you for shopping with us!`;
    return this.sendSMS(phone, message);
  }

  async sendPaymentReceived(phone, invoiceNumber, amount) {
    const message = `J&J VINTAGE: Payment received for order ${invoiceNumber} (GHc ${amount}). Your order has been received and is being processed for delivery!`;
    return this.sendSMS(phone, message);
  }

  async sendOrderStatusUpdate(phone, invoiceNumber, status) {
    const message = `J&J VINTAGE: Your order ${invoiceNumber} status update: ${status.toUpperCase()}. It is being processed for delivery!`;
    return this.sendSMS(phone, message);
  }
}

module.exports = new FasreachService();
