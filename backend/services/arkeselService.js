const axios = require('axios');

class ArkeselService {
  constructor() {
    this.apiKey = process.env.ARKESEL_API_KEY || '';
    this.senderId = process.env.ARKESEL_SENDER_ID || 'LUXURYFSHN';
    this.baseURL = 'https://sms.arkesel.com/api/v2/sms/send';
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
            message: message,
            recipients: [recipient],
          },
          {
            headers: {
              'api-key': this.apiKey,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(`[Arkesel SMS Sent] to ${recipient}`);
        return response.data;
      } catch (error) {
        console.error('[Arkesel SMS Error]', error.response?.data || error.message);
      }
    }

    // Simulation log
    console.log(`[Arkesel SMS Simulation] To: ${recipient} | Sender: ${this.senderId} | Msg: "${message}"`);
    return {
      status: 'success',
      message: 'SMS sent successfully (Simulation)',
      recipient,
    };
  }
}

module.exports = new ArkeselService();
