const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');
const Product = require('./models/Product');

async function checkOrderPricing() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const orders = await Order.find()
      .populate('items.product', 'name sku image price')
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log('=== 주문 pricing 구조 확인 ===');
    orders.forEach((order, index) => {
      console.log(`주문 ${index + 1}:`);
      console.log('  ID:', order._id);
      console.log('  orderNumber:', order.orderNumber);
      console.log('  pricing 객체:', order.pricing);
      console.log('  pricing.total:', order.pricing?.total);
      console.log('  totalAmount:', order.totalAmount);
      console.log('  pricing 타입:', typeof order.pricing?.total);
      console.log('  totalAmount 타입:', typeof order.totalAmount);
      console.log('---');
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkOrderPricing();