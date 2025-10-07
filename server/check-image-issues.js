const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkImageIssues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall');
    console.log('MongoDB 연결 성공');
    
    // 모든 상품의 이미지 URL 확인
    const products = await Product.find({});
    console.log(`총 ${products.length}개의 상품 확인 중...`);
    
    let problematicProducts = [];
    
    products.forEach(product => {
      const imageUrl = product.image?.url;
      if (imageUrl) {
        // 로컬 파일 경로나 잘못된 URL 패턴 확인
        if (imageUrl.includes('68db21d271e1497afdfd4e3') || 
            !imageUrl.startsWith('http') || 
            imageUrl.includes('localhost') ||
            imageUrl.includes('undefined')) {
          problematicProducts.push({
            id: product._id,
            name: product.name,
            imageUrl: imageUrl,
            publicId: product.image?.publicId
          });
        }
      }
    });
    
    if (problematicProducts.length > 0) {
      console.log('\n문제가 있는 상품들:');
      problematicProducts.forEach(product => {
        console.log('---');
        console.log('상품 ID:', product.id);
        console.log('상품명:', product.name);
        console.log('이미지 URL:', product.imageUrl);
        console.log('Public ID:', product.publicId);
      });
    } else {
      console.log('\n모든 상품의 이미지 URL이 정상입니다.');
    }
    
    // 샘플 상품 몇 개 출력
    console.log('\n샘플 상품 데이터:');
    products.slice(0, 3).forEach(product => {
      console.log('---');
      console.log('상품명:', product.name);
      console.log('이미지 URL:', product.image?.url || 'N/A');
    });
    
    await mongoose.disconnect();
    console.log('\n검사 완료');
  } catch (error) {
    console.error('오류:', error);
  }
}

checkImageIssues();