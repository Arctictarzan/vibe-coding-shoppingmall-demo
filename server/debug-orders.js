const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config();

async function debugOrders() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    console.log('\n=== 주문 디버깅 시작 ===');

    // 1. 전체 주문 개수 확인
    const totalOrders = await Order.countDocuments();
    console.log(`\n1. 전체 주문 개수: ${totalOrders}`);

    // 2. 최근 주문 5개 조회
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    console.log('\n2. 최근 주문 5개:');
    recentOrders.forEach((order, index) => {
      console.log(`\n주문 ${index + 1}:`);
      console.log(`  - ID: ${order._id}`);
      console.log(`  - 주문번호: ${order.orderNumber}`);
      console.log(`  - 사용자 ID: ${order.user?._id || 'null'}`);
      console.log(`  - 사용자 이름: ${order.user?.name || 'null'}`);
      console.log(`  - 사용자 이메일: ${order.user?.email || 'null'}`);
      console.log(`  - 상태: ${order.status}`);
      console.log(`  - 총액: ${order.pricing?.total}`);
      console.log(`  - 생성일: ${order.createdAt}`);
      console.log(`  - 상품 개수: ${order.items?.length || 0}`);
    });

    // 3. 특정 주문번호로 검색 (order_1759468035495)
    const specificOrder = await Order.findOne({ orderNumber: 'order_1759468035495' })
      .populate('user', 'name email');

    console.log('\n3. 특정 주문 (order_1759468035495) 검색:');
    if (specificOrder) {
      console.log(`  - 발견됨!`);
      console.log(`  - ID: ${specificOrder._id}`);
      console.log(`  - 사용자 ID: ${specificOrder.user?._id || 'null'}`);
      console.log(`  - 사용자 이름: ${specificOrder.user?.name || 'null'}`);
      console.log(`  - 사용자 이메일: ${specificOrder.user?.email || 'null'}`);
      console.log(`  - 상태: ${specificOrder.status}`);
      console.log(`  - 총액: ${specificOrder.pricing?.total}`);
    } else {
      console.log('  - 해당 주문번호를 찾을 수 없습니다!');
    }

    // 4. 전체 사용자 목록 확인
    const users = await User.find({}, 'name email').limit(10);
    console.log('\n4. 사용자 목록 (최대 10명):');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user._id}, 이름: ${user.name}, 이메일: ${user.email}`);
    });

    // 5. 사용자별 주문 개수 확인
    console.log('\n5. 사용자별 주문 개수:');
    const ordersByUser = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          orderNumbers: { $push: '$orderNumber' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      }
    ]);

    ordersByUser.forEach((item, index) => {
      const userInfo = item.userInfo[0];
      console.log(`  ${index + 1}. 사용자 ID: ${item._id}`);
      console.log(`     이름: ${userInfo?.name || 'null'}`);
      console.log(`     이메일: ${userInfo?.email || 'null'}`);
      console.log(`     주문 개수: ${item.count}`);
      console.log(`     주문번호들: ${item.orderNumbers.join(', ')}`);
      console.log('');
    });

    // 6. user 필드가 null인 주문 확인
    const ordersWithoutUser = await Order.find({ user: null });
    console.log(`\n6. user 필드가 null인 주문: ${ordersWithoutUser.length}개`);
    if (ordersWithoutUser.length > 0) {
      ordersWithoutUser.forEach((order, index) => {
        console.log(`  ${index + 1}. 주문번호: ${order.orderNumber}, 생성일: ${order.createdAt}`);
      });
    }

    console.log('\n=== 주문 디버깅 완료 ===');

  } catch (error) {
    console.error('디버깅 중 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

debugOrders();