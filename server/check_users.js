const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    // MongoDB 연결
    await mongoose.connect('mongodb://localhost:27017/shopping-mall');
    console.log('MongoDB 연결 성공');

    // 모든 사용자 조회
    const users = await User.find({});
    console.log(`\n총 사용자 개수: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n=== 사용자 목록 ===');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. 이름: ${user.name}`);
        console.log(`   이메일: ${user.email}`);
        console.log(`   사용자 ID: ${user._id}`);
        console.log(`   사용자 타입: ${user.user_type}`);
        console.log(`   생성일: ${user.createdAt}`);
      });
    }

    // 강재호 관련 사용자 찾기
    const jaehoUsers = await User.find({
      $or: [
        { name: '강재호' },
        { email: { $regex: /immissing/i } }
      ]
    });
    
    console.log(`\n강재호 관련 사용자 개수: ${jaehoUsers.length}`);
    if (jaehoUsers.length > 0) {
      console.log('\n=== 강재호 관련 사용자 ===');
      jaehoUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - ${user.email} - ID: ${user._id}`);
      });
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB 연결 종료');
  }
}

checkUsers();