const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: [true, '장바구니 정보가 필요합니다']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '상품 정보가 필요합니다']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 정보가 필요합니다']
  },
  quantity: {
    type: Number,
    required: [true, '수량을 입력해주세요'],
    min: [1, '수량은 1개 이상이어야 합니다'],
    max: [99, '수량은 99개를 초과할 수 없습니다'],
    default: 1
  },
  // 상품 옵션 (색상, 사이즈 등)
  selectedOptions: {
    color: {
      type: String,
      trim: true,
      default: null
    },
    size: {
      type: String,
      trim: true,
      default: null
    },
    // 추가 옵션들을 위한 확장 가능한 구조
    customOptions: {
      type: Map,
      of: String,
      default: new Map()
    }
  },
  // 장바구니에 추가된 시점의 상품 정보 (스냅샷)
  productSnapshot: {
    name: {
      type: String,
      required: [true, '상품명이 필요합니다']
    },
    price: {
      type: Number,
      required: [true, '가격이 필요합니다'],
      min: [0, '가격은 0보다 작을 수 없습니다']
    },
    originalPrice: {
      type: Number,
      min: [0, '원가는 0보다 작을 수 없습니다']
    },
    sku: {
      type: String,
      required: [true, 'SKU가 필요합니다']
    },
    image: {
      url: String,
      alt: String
    },
    category: {
      type: String,
      required: [true, '카테고리가 필요합니다']
    }
  },
  // 아이템별 총 가격 (quantity * price)
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, '총 가격은 0보다 작을 수 없습니다']
  },
  // 상태 관리
  status: {
    type: String,
    enum: ['active', 'saved_for_later', 'removed'],
    default: 'active'
  },
  // 나중에 구매하기 위해 저장된 날짜
  savedForLaterAt: {
    type: Date,
    default: null
  },
  // 장바구니에서 제거된 날짜
  removedAt: {
    type: Date,
    default: null
  },
  // 메모나 특별 요청사항
  notes: {
    type: String,
    maxlength: [500, '메모는 500자를 초과할 수 없습니다'],
    trim: true
  }
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

// 복합 인덱스 설정
cartItemSchema.index({ cart: 1, product: 1, 'selectedOptions.color': 1, 'selectedOptions.size': 1 }); // 중복 방지용
cartItemSchema.index({ user: 1, status: 1 }); // 사용자별 상태 조회용
cartItemSchema.index({ product: 1 }); // 상품별 조회용
cartItemSchema.index({ createdAt: -1 }); // 최신순 정렬용
cartItemSchema.index({ status: 1, updatedAt: -1 }); // 상태별 최근 업데이트순

// 총 가격 계산 미들웨어
cartItemSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('productSnapshot.price')) {
    this.totalPrice = this.quantity * this.productSnapshot.price;
  }
  next();
});

// 상품 옵션 문자열 생성 메서드
cartItemSchema.methods.getOptionsString = function() {
  const options = [];
  
  if (this.selectedOptions.color) {
    options.push(`색상: ${this.selectedOptions.color}`);
  }
  
  if (this.selectedOptions.size) {
    options.push(`사이즈: ${this.selectedOptions.size}`);
  }
  
  // 커스텀 옵션들 추가
  if (this.selectedOptions.customOptions && this.selectedOptions.customOptions.size > 0) {
    for (const [key, value] of this.selectedOptions.customOptions) {
      options.push(`${key}: ${value}`);
    }
  }
  
  return options.join(', ');
};

// 할인 금액 계산 메서드
cartItemSchema.methods.getDiscountAmount = function() {
  if (this.productSnapshot.originalPrice && this.productSnapshot.originalPrice > this.productSnapshot.price) {
    return (this.productSnapshot.originalPrice - this.productSnapshot.price) * this.quantity;
  }
  return 0;
};

// 할인율 계산 메서드
cartItemSchema.methods.getDiscountPercentage = function() {
  if (this.productSnapshot.originalPrice && this.productSnapshot.originalPrice > this.productSnapshot.price) {
    return Math.round(((this.productSnapshot.originalPrice - this.productSnapshot.price) / this.productSnapshot.originalPrice) * 100);
  }
  return 0;
};

// 나중에 구매하기로 이동
cartItemSchema.methods.saveForLater = function() {
  this.status = 'saved_for_later';
  this.savedForLaterAt = new Date();
};

// 활성 상태로 복원
cartItemSchema.methods.restoreToActive = function() {
  this.status = 'active';
  this.savedForLaterAt = null;
};

// 장바구니에서 제거
cartItemSchema.methods.remove = function() {
  this.status = 'removed';
  this.removedAt = new Date();
};

// JSON 변환 시 가상 필드 포함
cartItemSchema.set('toJSON', { virtuals: true });

// 가상 필드들
cartItemSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

cartItemSchema.virtual('isSavedForLater').get(function() {
  return this.status === 'saved_for_later';
});

cartItemSchema.virtual('isRemoved').get(function() {
  return this.status === 'removed';
});

cartItemSchema.virtual('hasDiscount').get(function() {
  return this.productSnapshot.originalPrice && this.productSnapshot.originalPrice > this.productSnapshot.price;
});

module.exports = mongoose.model('CartItem', cartItemSchema);