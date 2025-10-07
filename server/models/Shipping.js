const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  // 연결된 주문
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, '주문 정보가 필요합니다'],
    unique: true
  },
  
  // 배송 상태
  status: {
    type: String,
    enum: [
      'preparing',    // 배송 준비중
      'picked_up',    // 픽업 완료
      'in_transit',   // 배송중
      'out_for_delivery', // 배송 출발
      'delivered',    // 배송 완료
      'failed',       // 배송 실패
      'returned'      // 반송
    ],
    default: 'preparing'
  },
  
  // 배송사 정보
  carrier: {
    name: {
      type: String,
      required: [true, '배송사명을 입력해주세요'],
      enum: ['CJ대한통운', '한진택배', '롯데택배', '우체국택배', '로젠택배', 'GSPostbox']
    },
    code: {
      type: String,
      required: true
    },
    contact: {
      phone: String,
      website: String
    }
  },
  
  // 운송장 정보
  tracking: {
    number: {
      type: String,
      required: [true, '운송장 번호를 입력해주세요'],
      unique: true
    },
    url: String, // 배송 조회 URL
    qrCode: String // QR 코드 (선택사항)
  },
  
  // 배송 일정
  schedule: {
    // 픽업 예정일
    pickupDate: Date,
    // 배송 예정일
    estimatedDelivery: {
      type: Date,
      required: [true, '배송 예정일을 입력해주세요']
    },
    // 실제 배송일
    actualDelivery: Date,
    // 배송 시간대
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime'
    }
  },
  
  // 배송 주소 (Order에서 복사되지만 별도 관리)
  address: {
    recipient: {
      name: {
        type: String,
        required: [true, '수령인 이름을 입력해주세요']
      },
      phone: {
        type: String,
        required: [true, '수령인 연락처를 입력해주세요']
      }
    },
    location: {
      street: {
        type: String,
        required: [true, '상세 주소를 입력해주세요']
      },
      city: {
        type: String,
        required: [true, '시/도를 입력해주세요']
      },
      state: String,
      zipCode: {
        type: String,
        required: [true, '우편번호를 입력해주세요']
      },
      country: {
        type: String,
        default: 'Korea'
      }
    },
    // 배송 요청사항
    instructions: {
      type: String,
      maxlength: [500, '배송 요청사항은 500자를 초과할 수 없습니다']
    },
    // 부재시 처리 방법
    absenteeHandling: {
      type: String,
      enum: ['redelivery', 'safe_place', 'neighbor', 'pickup_center'],
      default: 'redelivery'
    }
  },
  
  // 배송 이력
  history: [{
    status: {
      type: String,
      required: true
    },
    location: String, // 현재 위치
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String, // 상태 설명
    signature: String // 서명 (배송 완료 시)
  }],
  
  // 배송비 정보
  cost: {
    base: {
      type: Number,
      default: 0,
      min: [0, '기본 배송비는 0보다 작을 수 없습니다']
    },
    additional: {
      type: Number,
      default: 0,
      min: [0, '추가 배송비는 0보다 작을 수 없습니다']
    },
    total: {
      type: Number,
      required: true,
      min: [0, '총 배송비는 0보다 작을 수 없습니다']
    }
  },
  
  // 배송 옵션
  options: {
    // 배송 방법
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'same_day'],
      default: 'standard'
    },
    // 특수 처리
    specialHandling: [{
      type: String,
      enum: ['fragile', 'cold_chain', 'hazardous', 'oversized']
    }],
    // 보험 가입 여부
    insurance: {
      enabled: {
        type: Boolean,
        default: false
      },
      amount: {
        type: Number,
        default: 0
      }
    }
  },
  
  // 반송 정보 (배송 실패 시)
  return: {
    reason: String,
    returnDate: Date,
    returnLocation: String,
    newDeliveryAttempt: Date
  },
  
  // 배송 완료 확인
  confirmation: {
    method: {
      type: String,
      enum: ['signature', 'photo', 'sms', 'call'],
      default: 'signature'
    },
    confirmedBy: String, // 수령인 이름
    confirmedAt: Date,
    photo: String, // 배송 완료 사진 URL
    signature: String // 서명 이미지 URL
  }
}, {
  timestamps: true
});

// 인덱스 설정
shippingSchema.index({ order: 1 }, { unique: true });
shippingSchema.index({ 'tracking.number': 1 }, { unique: true });
shippingSchema.index({ status: 1 });
shippingSchema.index({ 'carrier.name': 1 });
shippingSchema.index({ 'schedule.estimatedDelivery': 1 });

// 배송 상태 변경 시 이력 추가 미들웨어
shippingSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.history.push({
      status: this.status,
      timestamp: new Date(),
      description: `배송 상태가 ${this.status}로 변경되었습니다.`
    });
  }
  next();
});

// 배송비 총액 계산 미들웨어
shippingSchema.pre('save', function(next) {
  if (this.isModified('cost.base') || this.isModified('cost.additional')) {
    this.cost.total = this.cost.base + this.cost.additional;
  }
  next();
});

// 가상 필드: 배송 소요 시간
shippingSchema.virtual('deliveryDuration').get(function() {
  if (this.schedule.actualDelivery && this.createdAt) {
    const diffTime = this.schedule.actualDelivery - this.createdAt;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 일 단위
  }
  return null;
});

// 가상 필드: 배송 지연 여부
shippingSchema.virtual('isDelayed').get(function() {
  if (this.schedule.estimatedDelivery && !this.schedule.actualDelivery) {
    return new Date() > this.schedule.estimatedDelivery;
  }
  return false;
});

// JSON 변환 시 가상 필드 포함
shippingSchema.set('toJSON', { virtuals: true });

// 배송 상태 업데이트 메서드
shippingSchema.methods.updateStatus = function(status, location, description) {
  this.status = status;
  this.history.push({
    status: status,
    location: location,
    timestamp: new Date(),
    description: description
  });
};

// 배송 완료 처리 메서드
shippingSchema.methods.markAsDelivered = function(confirmedBy, confirmationMethod = 'signature') {
  this.status = 'delivered';
  this.schedule.actualDelivery = new Date();
  this.confirmation.confirmedBy = confirmedBy;
  this.confirmation.confirmedAt = new Date();
  this.confirmation.method = confirmationMethod;
  
  this.history.push({
    status: 'delivered',
    timestamp: new Date(),
    description: `${confirmedBy}님이 수령 완료하였습니다.`,
    signature: confirmedBy
  });
};

module.exports = mongoose.model('Shipping', shippingSchema);