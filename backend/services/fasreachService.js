const axios = require('axios');

class FasreachService {
  constructor() {
    this.apiKey = process.env.FASREACH_API_KEY || '';
    this.senderId = process.env.FASREACH_SENDER_ID || 'JJVINTAGE';
    this.baseURL = 'https://api.fasreach.com/v1/sms/send';
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

  formatPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.toString().replace(/[^0-9]/g, '');
    // Convert local Ghana 10-digit number e.g. 0241234567 -> 233241234567
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '233' + cleaned.substring(1);
    }
    return cleaned;
  }

  async sendSMS(recipient, message) {
    const { apiKey, senderId } = this.getCredentials();
    const formattedRecipient = this.formatPhoneNumber(recipient);

    if (apiKey && !apiKey.includes('your_fasreach') && !apiKey.includes('mock')) {
      try {
        console.log(`[FastReach SMS API] Sending to ${formattedRecipient} with SenderID ${senderId}...`);
        const response = await axios.post(
          this.baseURL,
          {
            recipient: formattedRecipient,
            sender_id: senderId,
            message: message,
          },
          {
            headers: {
              'x-api-key': apiKey,
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        console.log('[FastReach SMS Success]', response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('[FastReach SMS Error]', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
      }
    }

    // FastReach Simulation Mode when live API key is not yet configured
    console.log(`\n========================================`);
    console.log(`📱 [FastReach SMS Simulation]`);
    console.log(`To: ${formattedRecipient || recipient}`);
    console.log(`Sender ID: ${senderId}`);
    console.log(`Message: ${message}`);
    console.log(`========================================\n`);

    return {
      success: true,
      simulated: true,
      message: 'FastReach SMS logged in simulation mode (Enter live API key in Admin Settings to deliver real-time SMS)',
    };
  }

  async sendOrderConfirmation(phone, invoiceNumber, amount) {
    const message = `J&J VINTAGE: Thank you! Your order ${invoiceNumber} for GHc ${amount} has been placed successfully. Track your status on our site.`;
    return this.sendSMS(phone, message);
  }

  async sendPaymentReceived(phone, invoiceNumber, amount) {
    const message = `J&J VINTAGE: Payment received for order ${invoiceNumber} (GHc ${amount}). We are preparing your luxury package for dispatch!`;
    return this.sendSMS(phone, message);
  }

  async sendOrderStatusUpdate(phone, invoiceNumber, status) {
    const message = `J&J VINTAGE: Your order ${invoiceNumber} status has been updated to: ${status.toUpperCase()}. Thank you for shopping with us!`;
    return this.sendSMS(phone, message);
  }
}

module.exports = new FasreachService();
