const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall');
    console.log('MongoDB 연결 성공');

    // 기존 관리자 계정 확인
    const existingAdmin = await User.findOne({ user_type: 'admin' });
    
    if (existingAdmin) {
      console.log('기존 관리자 계정이 발견되었습니다:');
      console.log(`이메일: ${existingAdmin.email}`);
      console.log(`이름: ${existingAdmin.name}`);
      console.log(`생성일: ${existingAdmin.createdAt}`);
      
      // 비밀번호 재설정 옵션
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('기존 관리자 계정의 비밀번호를 재설정하시겠습니까? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          rl.question('새 비밀번호를 입력하세요: ', async (newPassword) => {
            if (newPassword.length < 6) {
              console.log('비밀번호는 최소 6자 이상이어야 합니다.');
              rl.close();
              process.exit(1);
            }
            
            existingAdmin.password = newPassword;
            await existingAdmin.save();
            console.log('관리자 계정 비밀번호가 성공적으로 재설정되었습니다!');
            console.log(`이메일: ${existingAdmin.email}`);
            console.log(`새 비밀번호: ${newPassword}`);
            rl.close();
            process.exit(0);
          });
        } else {
          console.log('기존 관리자 계정 정보:');
          console.log(`이메일: ${existingAdmin.email}`);
          console.log('비밀번호를 기억해내시거나 위 옵션으로 재설정하세요.');
          rl.close();
          process.exit(0);
        }
      });
      
      return;
    }

    // 새 관리자 계정 생성
    console.log('관리자 계정이 없습니다. 새로 생성합니다...');
    
    const adminData = {
      email: 'admin@cider.com',
      name: 'CIDER 관리자',
      password: 'admin123',
      user_type: 'admin'
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ 관리자 계정이 성공적으로 생성되었습니다!');
    console.log('==========================================');
    console.log(`이메일: ${adminData.email}`);
    console.log(`비밀번호: ${adminData.password}`);
    console.log(`이름: ${adminData.name}`);
    console.log('==========================================');
    console.log('이 정보를 안전한 곳에 보관하세요!');

  } catch (error) {
    console.error('오류 발생:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
    process.exit(0);
  }
};

// 모든 사용자 목록 조회 함수
const listAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall');
    console.log('MongoDB 연결 성공');

    const users = await User.find({}).select('email name user_type createdAt');
    
    if (users.length === 0) {
      console.log('등록된 사용자가 없습니다.');
    } else {
      console.log('\n=== 전체 사용자 목록 ===');
      users.forEach((user, index) => {
        console.log(`${index + 1}. 이메일: ${user.email}`);
        console.log(`   이름: ${user.name}`);
        console.log(`   타입: ${user.user_type}`);
        console.log(`   가입일: ${user.createdAt.toLocaleDateString()}`);
        console.log('-------------------');
      });
    }
  } catch (error) {
    console.error('오류 발생:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// 명령행 인수 확인
const args = process.argv.slice(2);

if (args.includes('--list') || args.includes('-l')) {
  listAllUsers();
} else {
  createAdmin();
}