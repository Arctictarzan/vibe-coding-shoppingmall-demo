const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const verifyStoredToken = async () => {
  try {
    // 여기에 브라우저에서 복사한 토큰을 넣어주세요
    // localStorage.getItem('token')으로 얻은 값
    const token = 'YOUR_TOKEN_HERE'; // 실제 토큰으로 교체 필요
    
    if (!token || token === 'YOUR_TOKEN_HERE') {
      console.log('토큰을 입력해주세요. 브라우저 개발자 도구에서 localStorage.getItem("token")으로 확인할 수 있습니다.');
      return;
    }

    console.log('토큰 검증 중...');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('토큰 디코딩 성공:', decoded);
      
      // MongoDB 연결
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall');
      
      const User = require('./models/User');
      const user = await User.findById(decoded.userId);
      
      if (user) {
        console.log('사용자 정보:', {
          id: user._id,
          name: user.name,
          email: user.email
        });
      } else {
        console.log('토큰의 사용자 ID에 해당하는 사용자를 찾을 수 없습니다.');
      }
      
      mongoose.disconnect();
    } catch (jwtError) {
      console.error('토큰 검증 실패:', jwtError.message);
    }
    
  } catch (error) {
    console.error('오류:', error);
  }
};

console.log('=== 토큰 검증 도구 ===');
console.log('브라우저 개발자 도구에서 다음 명령어를 실행하여 토큰을 확인하세요:');
console.log('localStorage.getItem("token")');
console.log('');
console.log('그 다음 이 파일의 token 변수에 해당 값을 넣고 다시 실행하세요.');

verifyStoredToken();