const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');

async function checkOrders() {
  try {
    // MongoDB 연결
    await mongoose.connect('mongodb://localhost:27017/shopping-mall');
    console.log('MongoDB 연결 성공');

    // 모든 주문 조회
    const orders = await Order.find({}).populate('user', 'name email');
    console.log(`\n총 주문 개수: ${orders.length}`);
    
    if (orders.length > 0) {
      console.log('\n=== 주문 목록 ===');
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. 주문번호: ${order.orderNumber}`);
        console.log(`   사용자: ${order.user?.name} (${order.user?.email})`);
        console.log(`   사용자 ID: ${order.user?._id}`);
        console.log(`   상태: ${order.status}`);
        console.log(`   총액: ${order.pricing?.total}원`);
        console.log(`   생성일: ${order.createdAt}`);
        console.log(`   상품 개수: ${order.items?.length}개`);
      });
    } else {
      console.log('\n주문 데이터가 없습니다.');
    }

    // 특정 사용자의 주문 확인 (강재호)
    const userOrders = await Order.find({}).populate('user', 'name email');
    const jaehoOrders = userOrders.filter(order => 
      order.user?.name === '강재호' || order.user?.email === 'immissingr1@gmail.com'
    );
    
    console.log(`\n강재호 사용자의 주문 개수: ${jaehoOrders.length}`);
    if (jaehoOrders.length > 0) {
      console.log('\n=== 강재호 사용자 주문 ===');
      jaehoOrders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber} - ${order.status} - ${order.pricing?.total}원`);
      });
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB 연결 종료');
  }
}

checkOrders();