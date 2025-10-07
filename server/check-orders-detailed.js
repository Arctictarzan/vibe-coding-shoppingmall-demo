const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

async function checkOrdersDetailed() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 모든 주문 조회
    const allOrders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });

    console.log('\n=== 전체 주문 목록 ===');
    console.log('총 주문 개수:', allOrders.length);

    allOrders.forEach((order, index) => {
      console.log(`\n주문 ${index + 1}:`);
      console.log('  ID:', order._id);
      console.log('  주문번호:', order.orderNumber);
      console.log('  사용자:', order.user?.name, '(' + order.user?.email + ')');
      console.log('  상태:', order.status);
      console.log('  총액:', order.pricing?.total);
      console.log('  생성일:', order.createdAt);
      console.log('  상품 개수:', order.items?.length);
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, itemIndex) => {
          console.log(`    상품 ${itemIndex + 1}: ${item.productSnapshot?.name} x ${item.quantity}`);
        });
      }
    });

    // 특정 사용자의 주문 조회 (가장 최근 사용자)
    if (allOrders.length > 0) {
      const latestUserId = allOrders[0].user._id;
      console.log('\n=== 최근 사용자의 주문 목록 ===');
      console.log('사용자 ID:', latestUserId);
      
      const userOrders = await Order.find({ user: latestUserId })
        .populate('items.product', 'name sku image')
        .sort({ createdAt: -1 });

      console.log('해당 사용자의 주문 개수:', userOrders.length);
      
      userOrders.forEach((order, index) => {
        console.log(`\n사용자 주문 ${index + 1}:`);
        console.log('  ID:', order._id);
        console.log('  주문번호:', order.orderNumber);
        console.log('  상태:', order.status);
        console.log('  총액:', order.pricing?.total);
        console.log('  생성일:', order.createdAt);
        console.log('  상품 개수:', order.items?.length);
      });
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB 연결 종료');
  }
}

checkOrdersDetailed();