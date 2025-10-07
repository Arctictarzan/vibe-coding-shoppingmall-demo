const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function checkOrderImages() {
  try {
    await client.connect();
    console.log('MongoDB 연결 성공');

    const db = client.db('shopping-mall');
    const ordersCollection = db.collection('orders');

    // 첫 번째 주문의 상세 정보 확인
    const order = await ordersCollection.findOne({}, { sort: { createdAt: -1 } });
    
    if (order) {
      console.log('주문 상세 정보:');
      console.log('주문 ID:', order._id);
      console.log('주문번호:', order.orderNumber);
      console.log('상태:', order.status);
      console.log('총액:', order.totalAmount);
      console.log('생성일:', order.createdAt);
      
      console.log('\n주문 상품 목록:');
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
          console.log(`\n상품 ${index + 1}:`);
          console.log('  상품 ID:', item.productId);
          console.log('  수량:', item.quantity);
          console.log('  가격:', item.price);
          
          if (item.productSnapshot) {
            console.log('  상품 스냅샷:');
            console.log('    이름:', item.productSnapshot.name);
            console.log('    설명:', item.productSnapshot.description);
            console.log('    이미지:', item.productSnapshot.image);
            console.log('    카테고리:', item.productSnapshot.category);
            console.log('    가격:', item.productSnapshot.price);
          } else {
            console.log('  상품 스냅샷: 없음');
          }
        });
      } else {
        console.log('주문 상품이 없습니다.');
      }
    } else {
      console.log('주문을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB 연결 종료');
  }
}

checkOrderImages();