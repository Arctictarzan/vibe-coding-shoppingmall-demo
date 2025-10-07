const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testOrdersAPI() {
  try {
    // 테스트용 토큰 생성 (실제 사용자 ID 사용)
    const userId = '68d53f2bbb056df55bcc188e'; // 데이터베이스에서 확인한 사용자 ID
    const token = jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('생성된 토큰:', token);
    console.log('사용자 ID:', userId);

    // API 호출
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/my-orders?page=1&limit=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(data),
              rawData: data
            });
          } catch (parseError) {
            resolve({
              status: res.statusCode,
              data: null,
              rawData: data,
              parseError: parseError.message
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('HTTP 요청 오류:', error);
        reject(error);
      });

      req.setTimeout(10000, () => {
        console.error('요청 타임아웃');
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });

    console.log('\n=== API 응답 ===');
    console.log('상태 코드:', response.status);
    
    if (response.parseError) {
      console.log('JSON 파싱 오류:', response.parseError);
      console.log('원본 응답:', response.rawData);
      return;
    }
    
    if (!response.data) {
      console.log('응답 데이터가 없습니다.');
      console.log('원본 응답:', response.rawData);
      return;
    }
    
    console.log('응답 데이터:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.success) {
      console.log('\n=== 주문 목록 분석 ===');
      console.log('성공:', response.data.success);
      console.log('주문 개수:', response.data.data?.orders?.length || 0);
      console.log('총 주문 수:', response.data.data?.totalOrders || 0);
      console.log('총 페이지:', response.data.data?.totalPages || 0);
      console.log('현재 페이지:', response.data.data?.currentPage || 0);

      if (response.data.data?.orders?.length > 0) {
        console.log('\n=== 첫 번째 주문 상세 ===');
        const firstOrder = response.data.data.orders[0];
        console.log('주문 ID:', firstOrder._id);
        console.log('주문번호:', firstOrder.orderNumber);
        console.log('상태:', firstOrder.status);
        console.log('총액:', firstOrder.pricing?.total);
        console.log('생성일:', firstOrder.createdAt);
        console.log('상품 개수:', firstOrder.items?.length);
      }
    }

  } catch (error) {
    console.error('API 호출 오류:', error.message);
  }
}

testOrdersAPI();