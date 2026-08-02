const axios = require('axios');

class FasreachService {
  constructor() {
    this.apiKey = process.env.FASREACH_API_KEY || 'bms_live_1785502841008_np14a00zkx';
    this.senderId = process.env.FASREACH_SENDER_ID || 'JJVINTAGE';
    this.baseURL = 'https://fasreach.com/api/sms/send';
  }

  getCredentials() {
    try {
      const adminController = require('../controllers/adminController');
      if (adminController.storeSettings) {
        return {
          apiKey: adminController.storeSettings.fasreachApiKey || this.apiKey,
          senderId: adminController.storeSettings.fasreachSenderId || this.senderId || 'JJVINTAGE',
        };
      }
    } catch (e) {}
    return { apiKey: this.apiKey, senderId: this.senderId };
  }

  async sendSMS(recipient, message) {
    const { apiKey, senderId } = this.getCredentials();
    const cleanPhone = (recipient || '').toString().replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      console.warn('[FastReach SMS Warning] Empty recipient phone number');
      return { success: false, message: 'No phone number provided' };
    }

    try {
      console.log(`[FastReach SMS Dispatch] To: ${cleanPhone} | Sender: ${senderId} | API Key: ${apiKey.substring(0, 10)}...`);
      
      const response = await axios.post(
        this.baseURL,
        {
          to: cleanPhone,
          message: message,
          sender: senderId,
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
      
      // Fallback try with default FASREACH sender if custom sender ID fails
      if (senderId !== 'FASREACH') {
        try {
          console.log(`[FastReach SMS Retry] Trying fallback sender FASREACH...`);
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
    const message = `J&J VINTAGE: Your order ${invoiceNumber} for GHc ${amount} has been confirmed! Thank you for shopping with us.`;
    return this.sendSMS(phone, message);
  }

  async sendPaymentReceived(phone, invoiceNumber, amount) {
    const message = `J&J VINTAGE: Payment received for order ${invoiceNumber} (GHc ${amount}). We are preparing your luxury package for dispatch!`;
    return this.sendSMS(phone, message);
  }

  async sendOrderStatusUpdate(phone, invoiceNumber, status) {
    const message = `J&J VINTAGE: Your order ${invoiceNumber} status has been updated to: ${status.toUpperCase()}.`;
    return this.sendSMS(phone, message);
  }
}

module.exports = new FasreachService();
