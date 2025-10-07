const mongoose = require('mongoose');
require('dotenv').config();

// Order 모델 정의
const orderSchema = new mongoose.Schema({
  orderNumber: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  pricing: {
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: Number
  },
  shipping: {
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  payment: {
    method: String,
    status: String,
    transactionId: String
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

async function checkOrderStatuses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 모든 주문의 상태값 확인
    const orders = await Order.find({}).select('orderNumber status user');
    console.log('\n=== 모든 주문의 상태값 ===');
    console.log('총 주문 개수:', orders.length);
    
    // 상태별 그룹화
    const statusGroups = {};
    orders.forEach(order => {
      const status = order.status || 'undefined';
      if (!statusGroups[status]) {
        statusGroups[status] = [];
      }
      statusGroups[status].push(order);
    });

    console.log('\n=== 상태별 주문 개수 ===');
    Object.keys(statusGroups).forEach(status => {
      console.log(`${status}: ${statusGroups[status].length}개`);
    });

    // 특정 사용자의 주문 확인 (첫 번째 사용자)
    if (orders.length > 0) {
      const firstUserId = orders[0].user;
      const userOrders = await Order.find({ user: firstUserId }).select('orderNumber status');
      console.log(`\n=== 사용자 ${firstUserId}의 주문 상태 ===`);
      console.log('사용자 주문 개수:', userOrders.length);
      
      const userStatusGroups = {};
      userOrders.forEach(order => {
        const status = order.status || 'undefined';
        if (!userStatusGroups[status]) {
          userStatusGroups[status] = [];
        }
        userStatusGroups[status].push(order);
      });

      Object.keys(userStatusGroups).forEach(status => {
        console.log(`${status}: ${userStatusGroups[status].length}개`);
      });
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB 연결 종료');
  }
}

checkOrderStatuses();