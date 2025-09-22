const { secret } = require('../config/secret');
const axios = require('axios');

class KorapayService {
  constructor() {
    this.publicKey = secret.korapay_public_key;
    this.secretKey = secret.korapay_secret_key;
    this.baseUrl = 'https://api.korapay.com/merchant/api/v1';
  }

  async initializeTransaction(data) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/charges/initialize`,
        {
          amount: data.amount,
          currency: "NGN",
          reference: `ORDER-${Date.now()}`,
          notification_url: `${secret.store_url}/api/payment/webhook`,
          redirect_url: `${secret.store_url}/order/confirm`,
          customer: {
            name: data.name,
            email: data.email
          },
          merchant_bears_cost: true,
          payment_channels: ["card"],
          metadata: {
            orderId: data.orderId,
            isPartialPayment: data.isPartialPayment,
            totalAmount: data.totalAmount
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment initialization failed');
    }
  }

  async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/charges/query?reference=${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  }
}

module.exports = new KorapayService();