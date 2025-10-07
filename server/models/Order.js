const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // === 주문 기본 정보 ===
  // 주문 번호 (자동 생성)
  orderNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  
  // 주문자 정보
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '주문자 정보가 필요합니다']
  },
  
  // === 주문 상품 정보 ===
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, '상품 정보가 필요합니다']
    },
    // 주문 시점의 상품 정보 (가격 변동 대비)
    productSnapshot: {
      sku: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: {
        url: String,
        alt: String
      },
      category: String // 카테고리 추가
    },
    quantity: {
      type: Number,
      required: [true, '수량을 입력해주세요'],
      min: [1, '수량은 1개 이상이어야 합니다']
    },
    // 선택된 옵션 (색상, 사이즈 등)
    selectedOptions: {
      color: String,
      size: String
    },
    // 개별 상품 총 가격 (단가 × 수량)
    itemTotal: {
      type: Number,
      required: true,
      min: [0, '상품 총 가격은 0보다 작을 수 없습니다']
    }
  }],
  
  // === 금액 정보 ===
  pricing: {
    // 상품 총액
    subtotal: {
      type: Number,
      required: true,
      min: [0, '상품 총액은 0보다 작을 수 없습니다']
    },
    // 배송비
    shippingFee: {
      type: Number,
      default: 3000, // 기본 배송비 3,000원
      min: [0, '배송비는 0보다 작을 수 없습니다']
    },
    // 할인 금액 (쿠폰, 적립금 등)
    discount: {
      type: Number,
      default: 0,
      min: [0, '할인 금액은 0보다 작을 수 없습니다']
    },
    // 최종 결제 금액 (상품총액 + 배송비 - 할인금액)
    total: {
      type: Number,
      required: true,
      min: [0, '총 결제 금액은 0보다 작을 수 없습니다']
    }
  },
  
  // === 배송 정보 ===
  shipping: {
    // 수령인 이름
    recipientName: {
      type: String,
      required: [true, '수령인 이름을 입력해주세요'],
      trim: true
    },
    // 연락처
    phone: {
      type: String,
      required: [true, '수령인 연락처를 입력해주세요'],
      validate: {
        validator: function(v) {
          return /^[0-9-+().\s]+$/.test(v);
        },
        message: '올바른 전화번호 형식을 입력해주세요'
      }
    },
    // 우편번호
    zipCode: {
      type: String,
      required: [true, '우편번호를 입력해주세요']
    },
    // 주소
    address: {
      type: String,
      required: [true, '주소를 입력해주세요']
    },
    // 상세주소
    detailAddress: {
      type: String,
      required: [true, '상세주소를 입력해주세요']
    },
    // 배송 요청사항
    instructions: {
      type: String,
      maxlength: [500, '배송 요청사항은 500자를 초과할 수 없습니다'],
      default: ''
    }
  },
  
  // === 결제 정보 ===
  payment: {
    // 결제 수단
    method: {
      type: String,
      required: [true, '결제 수단을 선택해주세요'],
      enum: {
        values: ['credit-card', 'bank-transfer', 'real-time-transfer', 'naver-pay', 'kakao-pay', 'toss-pay'],
        message: '결제 수단은 신용카드, 계좌이체, 실시간계좌이체, 네이버페이, 카카오페이, 토스페이 중 선택해주세요'
      }
    },
    // 결제 상태
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    // 결제 완료 시간
    paidAt: Date,
    // 거래 ID (결제 게이트웨이에서 제공)
    transactionId: String,
    // Creem 결제 관련 정보
    creemInfo: {
      // Creem 사용자 ID
      creemUserId: String,
      // Creem 결제 토큰
      paymentToken: String,
      // Creem 잔액 사용 금액
      usedAmount: {
        type: Number,
        min: [0, 'Creem 사용 금액은 0보다 작을 수 없습니다']
      }
    }
  },
  
  // === 주문 상태 ===
  status: {
    type: String,
    enum: {
      values: [
        'order_confirmed',    // 주문 확인
        'preparing',         // 상품 준비중
        'shipping_started',  // 배송 시작
        'in_delivery',       // 배송중
        'delivered',         // 배송 완료
        'cancelled'          // 주문 취소
      ],
      message: '올바른 주문 상태를 선택해주세요'
    },
    default: 'order_confirmed'
  },
  
  // === 추가 정보 ===
  // 배송 추적 정보 (선택사항)
  tracking: {
    carrier: String, // 택배사 (예: CJ대한통운, 한진택배)
    trackingNumber: String, // 운송장 번호
    estimatedDelivery: Date // 예상 배송일
  },
  
  // 주문 메모 (관리자용)
  adminNotes: {
    type: String,
    maxlength: [500, '관리자 메모는 500자를 초과할 수 없습니다'],
    default: ''
  }
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

// 인덱스 설정
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 }); // 사용자별 주문 조회
orderSchema.index({ status: 1 }); // 상태별 주문 조회
orderSchema.index({ createdAt: -1 }); // 최신 주문순 정렬

// 주문번호 자동 생성 미들웨어
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 동시성 문제 해결을 위해 재시도 로직 추가
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        // 현재 시간의 밀리초와 랜덤 숫자를 조합하여 고유성 보장
        const timestamp = Date.now().toString().slice(-6); // 마지막 6자리
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const uniqueId = `${timestamp}${random}`.slice(-6); // 6자리로 제한
        
        const candidateOrderNumber = `ORD${dateStr}${uniqueId}`;
        
        // 중복 확인
        const existingOrder = await this.constructor.findOne({ 
          orderNumber: candidateOrderNumber 
        });
        
        if (!existingOrder) {
          this.orderNumber = candidateOrderNumber;
          break;
        }
        
        attempts++;
        // 짧은 대기 후 재시도
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('주문번호 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    }
    
    if (!this.orderNumber) {
      throw new Error('주문번호 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }
  next();
});

// 총 결제 금액 자동 계산 미들웨어
orderSchema.pre('save', function(next) {
  if (this.isModified('pricing.subtotal') || this.isModified('pricing.shippingFee') || this.isModified('pricing.discount')) {
    this.pricing.total = this.pricing.subtotal + this.pricing.shippingFee - this.pricing.discount;
  }
  next();
});

// 가상 필드: 총 상품 개수
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// JSON 변환 시 가상 필드 포함
orderSchema.set('toJSON', { virtuals: true });

// 주문 취소 메서드
orderSchema.methods.cancel = function(reason) {
  if (['order_confirmed', 'preparing'].includes(this.status)) {
    this.status = 'cancelled';
    if (reason) {
      this.adminNotes = `취소 사유: ${reason}`;
    }
    return true;
  }
  return false;
};

module.exports = mongoose.model('Order', orderSchema);