const KorapayService = require('../services/korapay.service');
const Order = require('../model/Order');

exports.initializePayment = async (req, res, next) => {
  try {
    const { amount, orderId, name, email, isPartialPayment, totalAmount } = req.body;
    
    const paymentData = {
      amount,
      orderId,
      name,
      email,
      isPartialPayment,
      totalAmount
    };

    const response = await KorapayService.initializeTransaction(paymentData);
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.query;
    const response = await KorapayService.verifyTransaction(reference);
    
    if (response.status === 'success') {
      const { orderId, isPartialPayment } = response.metadata;
      
      // Update order status based on payment type
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: isPartialPayment ? 'partial' : 'paid',
        status: 'Processing'
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: response
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    const event = req.body;
    
    if (event.event === 'charge.success') {
      const { orderId, isPartialPayment } = event.data.metadata;
      
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: isPartialPayment ? 'partial' : 'paid',
        status: 'Processing'
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};