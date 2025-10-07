const mongoose = require('mongoose');
require('dotenv').config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_ALTAS_URL || 'mongodb://localhost:27017/shopping-mall');
    console.log('MongoDB 연결 성공');
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('현재 데이터베이스의 사용자 정보:');
    users.forEach(user => {
      console.log(`이메일: ${user.email}, user_type: ${user.user_type}, 이름: ${user.name}`);
    });
    
  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkUser();