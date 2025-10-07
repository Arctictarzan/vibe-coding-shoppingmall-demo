const mongoose = require('mongoose');
require('dotenv').config();

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');
    
    const Order = require('./models/Order');
    const User = require('./models/User');
    
    // 전체 주문 개수 확인
    const totalOrders = await Order.countDocuments();
    console.log('전체 주문 개수:', totalOrders);
    
    // 모든 사용자 조회
    const users = await User.find({}, 'name email');
    console.log('\n전체 사용자 목록:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    
    // immissingy1@gmail.com 사용자 확인
    const targetUser = await User.findOne({ email: 'immissingy1@gmail.com' });
    if (targetUser) {
      console.log('\n대상 사용자 정보:');
      console.log('  ID:', targetUser._id);
      console.log('  이름:', targetUser.name);
      console.log('  이메일:', targetUser.email);
      
      // 해당 사용자의 주문 조회
      const userOrders = await Order.find({ user: targetUser._id })
        .sort({ createdAt: -1 });
      
      console.log(`\n${targetUser.email} 사용자의 주문 개수:`, userOrders.length);
      
      if (userOrders.length > 0) {
        console.log('해당 사용자의 주문 목록:');
        userOrders.forEach((order, index) => {
          console.log(`  ${index + 1}. ${order.orderNumber} - ${order.pricing?.total}원 - ${order.status}`);
        });
      }
    } else {
      console.log('\nimmissingy1@gmail.com 사용자를 찾을 수 없습니다.');
    }
    
    // 최신 주문 5개 조회 (populate 포함)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\n최신 주문 5개:');
    recentOrders.forEach((order, index) => {
      console.log(`${index + 1}. 주문ID: ${order._id}`);
      console.log(`   주문번호: ${order.orderNumber}`);
      console.log(`   사용자 ID: ${order.user?._id || '없음'}`);
      console.log(`   사용자: ${order.user?.name || '없음'} (${order.user?.email || '없음'})`);
      console.log(`   총액: ${order.pricing?.total}`);
      console.log(`   상태: ${order.status}`);
      console.log(`   생성일: ${order.createdAt}`);
      console.log('---');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('오류:', error);
  }
}

checkOrders();