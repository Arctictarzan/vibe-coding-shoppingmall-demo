const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 정보가 필요합니다'],
    unique: true // 한 사용자당 하나의 장바구니만 가능
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, '상품 정보가 필요합니다']
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
        trim: true
      },
      size: {
        type: String,
        trim: true
      }
    },
    // 장바구니에 추가된 시점의 가격 (가격 변동 추적용)
    priceAtAdd: {
      type: Number,
      required: [true, '추가 시점 가격이 필요합니다'],
      min: [0, '가격은 0보다 작을 수 없습니다']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // 장바구니 총 금액 (계산된 값)
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, '총 금액은 0보다 작을 수 없습니다']
  },
  // 장바구니 총 상품 개수 (계산된 값)
  totalItems: {
    type: Number,
    default: 0,
    min: [0, '총 상품 개수는 0보다 작을 수 없습니다']
  },
  // 마지막 업데이트 시간
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

// 인덱스 설정
cartSchema.index({ user: 1 }, { unique: true }); // 사용자별 유니크 장바구니
cartSchema.index({ 'items.product': 1 }); // 상품별 검색용
cartSchema.index({ lastUpdated: -1 }); // 최근 업데이트순 정렬용

// 장바구니 총 금액과 상품 개수 계산 미들웨어
cartSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    // 총 금액 계산
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.priceAtAdd * item.quantity);
    }, 0);
    
    // 총 상품 개수 계산
    this.totalItems = this.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
    
    // 마지막 업데이트 시간 갱신
    this.lastUpdated = new Date();
  }
  next();
});

// 특정 상품이 장바구니에 있는지 확인하는 메서드
cartSchema.methods.hasProduct = function(productId, options = {}) {
  return this.items.some(item => {
    const productMatch = item.product.toString() === productId.toString();
    
    // 옵션이 제공된 경우 옵션도 비교
    if (options.color || options.size) {
      const colorMatch = !options.color || item.selectedOptions.color === options.color;
      const sizeMatch = !options.size || item.selectedOptions.size === options.size;
      return productMatch && colorMatch && sizeMatch;
    }
    
    return productMatch;
  });
};

// 특정 상품의 수량 가져오기
cartSchema.methods.getProductQuantity = function(productId, options = {}) {
  const item = this.items.find(item => {
    const productMatch = item.product.toString() === productId.toString();
    
    if (options.color || options.size) {
      const colorMatch = !options.color || item.selectedOptions.color === options.color;
      const sizeMatch = !options.size || item.selectedOptions.size === options.size;
      return productMatch && colorMatch && sizeMatch;
    }
    
    return productMatch;
  });
  
  return item ? item.quantity : 0;
};

// 장바구니 비우기
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalAmount = 0;
  this.totalItems = 0;
  this.lastUpdated = new Date();
};

// JSON 변환 시 가상 필드 포함
cartSchema.set('toJSON', { virtuals: true });

// 장바구니 아이템 개수 가상 필드
cartSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// 빈 장바구니 여부 가상 필드
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

module.exports = mongoose.model('Cart', cartSchema);