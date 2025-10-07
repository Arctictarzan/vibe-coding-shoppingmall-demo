const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall');
    console.log('MongoDB 연결 성공');

    // 관리자 계정 찾기
    const admin = await User.findOne({ user_type: 'admin' });
    
    if (!admin) {
      console.log('관리자 계정을 찾을 수 없습니다.');
      process.exit(1);
    }

    // 새 비밀번호 설정 (간단한 비밀번호로 재설정)
    const newPassword = 'admin123';
    admin.password = newPassword;
    await admin.save();

    console.log('✅ 관리자 계정 비밀번호가 재설정되었습니다!');
    console.log('==========================================');
    console.log(`이메일: ${admin.email}`);
    console.log(`새 비밀번호: ${newPassword}`);
    console.log(`이름: ${admin.name}`);
    console.log('==========================================');
    console.log('이 정보로 로그인하세요!');

  } catch (error) {
    console.error('오류 발생:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
    process.exit(0);
  }
};

resetAdminPassword();