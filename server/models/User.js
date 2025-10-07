const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '이메일을 입력해주세요'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      '올바른 이메일 형식을 입력해주세요'
    ]
  },
  name: {
    type: String,
    required: [true, '이름을 입력해주세요'],
    trim: true,
    maxlength: [50, '이름은 50자를 초과할 수 없습니다']
  },
  password: {
    type: String,
    required: [true, '비밀번호를 입력해주세요'],
    minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다'],
    select: false // 기본적으로 비밀번호는 조회되지 않음
  },
  user_type: {
    type: String,
    required: [true, '사용자 타입을 선택해주세요'],
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Korea'
    }
  }
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

// 비밀번호 암호화 미들웨어
userSchema.pre('save', async function(next) {
  // 비밀번호가 수정되지 않았다면 다음으로
  if (!this.isModified('password')) return next();
  
  // 비밀번호 해싱
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JSON 변환 시 비밀번호 제외
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);