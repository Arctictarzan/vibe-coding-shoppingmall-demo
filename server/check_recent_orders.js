const mongoose = require('mongoose');
require('dotenv').config();

// 모델들 import
const User = require('./models/User');
const Order = require('./models/Order');

async function checkRecentOrders() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 최근 24시간 내 생성된 주문 찾기
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentOrders = await Order.find({
      createdAt: { $gte: yesterday }
    }).populate('user').sort({ createdAt: -1 });

    console.log(`\n📦 최근 24시간 내 생성된 주문 (총 ${recentOrders.length}개):`);
    
    if (recentOrders.length > 0) {
      recentOrders.forEach((order, index) => {
        console.log(`\n주문 ${index + 1}:`);
        console.log('  주문 번호:', order.orderNumber);
        console.log('  사용자:', order.user?.name || '알 수 없음');
        console.log('  이메일:', order.user?.email || '알 수 없음');
        console.log('  사용자 ID:', order.user?._id || order.user);
        console.log('  상태:', order.status);
        console.log('  총 금액:', order.totalAmount);
        console.log('  생성일:', order.createdAt);
        console.log('  상품 수:', order.items?.length || 0);
        
        if (order.items && order.items.length > 0) {
          console.log('  상품 목록:');
          order.items.forEach((item, itemIndex) => {
            console.log(`    ${itemIndex + 1}. ${item.name} - 수량: ${item.quantity}, 가격: ${item.price}`);
          });
        }
      });
    } else {
      console.log('  최근 24시간 내 생성된 주문이 없습니다.');
    }

    // 전체 주문 수도 확인
    const totalOrders = await Order.countDocuments();
    console.log(`\n📊 전체 주문 수: ${totalOrders}개`);

    // 가장 최근 주문 5개 확인
    const latestOrders = await Order.find().populate('user').sort({ createdAt: -1 }).limit(5);
    console.log(`\n🕐 가장 최근 주문 5개:`);
    
    latestOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} - ${order.user?.email || '알 수 없음'} - ${order.createdAt}`);
    });

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB 연결 종료');
  }
}

checkRecentOrders();