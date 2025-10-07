const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall')
  .then(async () => {
    console.log('MongoDB 연결 성공');
    
    const Order = require('./models/Order');
    const User = require('./models/User');
    
    // 모든 사용자 조회
    const users = await User.find();
    console.log('등록된 사용자들:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}, 이메일: ${user.email}, 이름: ${user.name}`);
    });
    
    console.log('\n주문과 사용자 매칭:');
    const orders = await Order.find().populate('user', 'name email');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. 주문번호: ${order.orderNumber}`);
      console.log(`   사용자 ID: ${order.user._id || order.user}`);
      console.log(`   사용자 정보: ${order.user.name} (${order.user.email})`);
      console.log(`   생성일: ${order.createdAt}`);
      console.log('');
    });
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB 연결 실패:', err);
    process.exit(1);
  });