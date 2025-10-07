const mongoose = require('mongoose');
require('dotenv').config();

// 모델들 import
const User = require('./models/User');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const CartItem = require('./models/CartItem');

async function checkImmissingr1Data() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // immissingr1 사용자 찾기
    const user = await User.findOne({ email: 'immissingr1@gmail.com' });
    
    if (!user) {
      console.log('❌ immissingr1@gmail.com 사용자를 찾을 수 없습니다.');
      return;
    }

    console.log('\n📋 immissingr1 사용자 정보:');
    console.log('사용자 ID:', user._id);
    console.log('이름:', user.name);
    console.log('이메일:', user.email);
    console.log('생성일:', user.createdAt);
    console.log('활성 상태:', user.isActive);

    // 해당 사용자의 주문 찾기
    const orders = await Order.find({ user: user._id }).populate('user');
    console.log(`\n📦 주문 정보 (총 ${orders.length}개):`);
    
    if (orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`\n주문 ${index + 1}:`);
        console.log('  주문 번호:', order.orderNumber);
        console.log('  상태:', order.status);
        console.log('  총 금액:', order.totalAmount);
        console.log('  생성일:', order.createdAt);
        console.log('  상품 수:', order.items.length);
      });
    } else {
      console.log('  주문이 없습니다.');
    }

    // 해당 사용자의 장바구니 찾기
    const cart = await Cart.findOne({ user: user._id });
    console.log(`\n🛒 장바구니 정보:`);
    
    if (cart) {
      const cartItems = await CartItem.find({ cart: cart._id }).populate('product');
      console.log('  장바구니 ID:', cart._id);
      console.log('  상품 수:', cartItems.length);
      
      if (cartItems.length > 0) {
        cartItems.forEach((item, index) => {
          console.log(`  상품 ${index + 1}: ${item.product?.name || '알 수 없음'} (수량: ${item.quantity})`);
        });
      }
    } else {
      console.log('  장바구니가 없습니다.');
    }

    console.log('\n🔍 데이터 요약:');
    console.log(`- 사용자: ${user.name} (${user.email})`);
    console.log(`- 주문 수: ${orders.length}`);
    console.log(`- 장바구니: ${cart ? '있음' : '없음'}`);

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB 연결 종료');
  }
}

checkImmissingr1Data();