const mongoose = require('mongoose');
require('dotenv').config();

const updateUserFields = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_ALTAS_URL || 'mongodb://localhost:27017/shopping-mall');
    console.log('MongoDB 연결 성공');

    // role 필드를 user_type으로 변경
    const result = await mongoose.connection.db.collection('users').updateMany(
      { role: { $exists: true } },
      { 
        $rename: { role: 'user_type' },
        $unset: { username: '' }
      }
    );

    console.log('업데이트 결과:', result);

    // 업데이트된 사용자 정보 확인
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('업데이트된 사용자 목록:');
    users.forEach(user => {
      console.log(`이메일: ${user.email}, user_type: ${user.user_type}, role: ${user.role}`);
    });

  } catch (error) {
    console.error('오류 발생:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

updateUserFields();