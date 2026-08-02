const axios = require('axios');

class FastReachSMSService {
  constructor() {
    this.apiKey = process.env.FASREACH_API_KEY || '';
    this.senderId = process.env.FASREACH_SENDER_ID || 'JJVINTAGE';
    this.baseURL = 'https://api.fasreach.com/v1/sms/send';
  }

  isConfigured() {
    return this.apiKey && !this.apiKey.includes('mock');
  }

  async sendSMS({ recipient, message }) {
    if (this.isConfigured()) {
      try {
        const response = await axios.post(
          this.baseURL,
          {
            sender: this.senderId,
            recipient: recipient,
            message: message,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(`[FastReach SMS Sent] to ${recipient}`);
        return response.data;
      } catch (error) {
        console.error('[FastReach SMS Error]', error.response?.data || error.message);
      }
    }

    // Simulation log when no live key is configured
    console.log(`[FastReach SMS Simulation] To: ${recipient} | Sender: ${this.senderId} | Msg: "${message}"`);
    return {
      status: 'success',
      message: 'SMS dispatched successfully via FastReach (Simulation)',
      recipient,
      sender: this.senderId,
    };
  }
}

module.exports = new FastReachSMSService();
