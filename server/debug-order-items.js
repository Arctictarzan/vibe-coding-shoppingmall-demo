const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const Order = require('./models/Order');
const Product = require('./models/Product');

async function debugOrderItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 최신 주문 1개 가져오기
    const latestOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .populate('items.product', 'name sku image price');

    console.log('\n=== 최신 주문 상세 정보 ===');
    console.log('주문 ID:', latestOrder._id);
    console.log('주문 번호:', latestOrder.orderNumber);
    console.log('총액:', latestOrder.pricing?.total);
    console.log('상품 개수:', latestOrder.items?.length);

    console.log('\n=== 주문 상품 목록 ===');
    if (latestOrder.items) {
      latestOrder.items.forEach((item, index) => {
        console.log(`\n상품 ${index + 1}:`);
        console.log('  - product ID:', item.product?._id || item.product);
        console.log('  - product 타입:', typeof item.product);
        console.log('  - product 내용:', item.product);
        console.log('  - 수량:', item.quantity);
        console.log('  - 가격:', item.price);
        console.log('  - 사이즈:', item.size);
        console.log('  - 색상:', item.color);
      });
    }

    // populate 없이 원본 데이터 확인
    const rawOrder = await Order.findById(latestOrder._id);
    console.log('\n=== 원본 주문 데이터 (populate 없음) ===');
    console.log('원본 items:', JSON.stringify(rawOrder.items, null, 2));

    // 실제 Product 컬렉션 확인
    console.log('\n=== Product 컬렉션 확인 ===');
    const products = await Product.find().limit(5);
    console.log('Product 개수:', await Product.countDocuments());
    console.log('첫 번째 상품들:');
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ID: ${product._id}, 이름: ${product.name}, 이미지: ${product.image}`);
    });

    // 주문의 product ID가 실제 존재하는지 확인
    if (rawOrder.items && rawOrder.items.length > 0) {
      console.log('\n=== Product ID 존재 여부 확인 ===');
      for (let i = 0; i < rawOrder.items.length; i++) {
        const item = rawOrder.items[i];
        const productId = item.product;
        console.log(`상품 ${i + 1} ID: ${productId}`);
        
        const existingProduct = await Product.findById(productId);
        if (existingProduct) {
          console.log(`  ✅ 존재함: ${existingProduct.name}`);
        } else {
          console.log(`  ❌ 존재하지 않음`);
        }
      }
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB 연결 종료');
  }
}

debugOrderItems();