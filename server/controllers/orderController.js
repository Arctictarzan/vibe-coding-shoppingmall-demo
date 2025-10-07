const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 포트원 결제 검증 함수
const verifyPayment = async (imp_uid, merchant_uid, amount) => {
  try {
    console.log('결제 검증 시작:', { imp_uid, merchant_uid, amount });
    
    // 포트원 API 키 확인
    const imp_key = process.env.IAMPORT_API_KEY;
    const imp_secret = process.env.IAMPORT_API_SECRET;
    
    console.log('포트원 API 키 확인:', { 
      imp_key: imp_key ? '설정됨' : '미설정', 
      imp_secret: imp_secret ? '설정됨' : '미설정' 
    });
    
    if (!imp_key || !imp_secret) {
      throw new Error("포트원 API 키가 설정되지 않았습니다");
    }

    // 포트원 Access Token 발급
    console.log('포트원 토큰 발급 요청 시작');
    const tokenResponse = await fetch("https://api.iamport.kr/users/getToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imp_key: imp_key,
        imp_secret: imp_secret
      }),
    });

    console.log('토큰 응답 상태:', tokenResponse.status, tokenResponse.statusText);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('토큰 발급 실패 응답:', errorText);
      throw new Error(`포트원 토큰 발급 실패: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('토큰 발급 응답:', tokenData);
    
    if (tokenData.code !== 0) {
      throw new Error(`포트원 토큰 발급 오류: ${tokenData.message}`);
    }

    const access_token = tokenData.response.access_token;
    console.log('액세스 토큰 발급 성공');

    // 결제 정보 조회
    console.log('결제 정보 조회 시작:', imp_uid);
    const paymentResponse = await fetch(`https://api.iamport.kr/payments/${imp_uid}`, {
      method: "GET",
      headers: {
        "Authorization": access_token
      }
    });

    console.log('결제 정보 조회 응답 상태:', paymentResponse.status, paymentResponse.statusText);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('결제 정보 조회 실패 응답:', errorText);
      throw new Error(`결제 정보 조회 실패: ${paymentResponse.status} ${paymentResponse.statusText}`);
    }

    const paymentData = await paymentResponse.json();
    console.log('결제 정보 조회 응답:', paymentData);
    
    if (paymentData.code !== 0) {
      throw new Error(`결제 정보 조회 오류: ${paymentData.message}`);
    }

    const paymentInfo = paymentData.response;
    console.log('결제 정보:', {
      status: paymentInfo.status,
      merchant_uid: paymentInfo.merchant_uid,
      amount: paymentInfo.amount,
      expected_merchant_uid: merchant_uid,
      expected_amount: amount
    });

    // 결제 검증
    if (paymentInfo.status !== "paid") {
      throw new Error(`결제가 완료되지 않았습니다. 현재 상태: ${paymentInfo.status}`);
    }

    if (paymentInfo.merchant_uid !== merchant_uid) {
      throw new Error(`주문번호가 일치하지 않습니다. 예상: ${merchant_uid}, 실제: ${paymentInfo.merchant_uid}`);
    }

    if (paymentInfo.amount !== amount) {
      throw new Error(`결제금액이 일치하지 않습니다. 예상: ${amount}, 실제: ${paymentInfo.amount}`);
    }

    console.log('결제 검증 성공');
    return {
      success: true,
      paymentInfo: paymentInfo
    };

  } catch (error) {
    console.error('결제 검증 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 주문 생성 (장바구니에서 주문으로 변환)
exports.createOrder = async (req, res) => {
  try {
    const { shipping, payment } = req.body;
    const userId = req.user._id;

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '장바구니가 비어있습니다.'
      });
    }

    // 재고 확인 및 주문 아이템 준비
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      // 상품 활성화 및 재고 확인
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `${product.name} 상품이 비활성화되었습니다.`
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} 상품의 재고가 부족합니다. (재고: ${product.stock}개)`
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productSnapshot: {
          sku: product.sku,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category
        },
        quantity: cartItem.quantity,
        selectedOptions: cartItem.selectedOptions || {},
        itemTotal: itemTotal
      });
    }

    // 배송비 계산 (기본 3000원, 50000원 이상 무료배송)
    const shippingFee = subtotal >= 50000 ? 0 : 3000;
    const discount = req.body.discount || 0;
    const total = subtotal + shippingFee - discount;

    // 주문 생성
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      pricing: {
        subtotal,
        shippingFee,
        discount,
        total
      },
      shipping,
      payment: {
        ...payment,
        status: 'pending'
      },
      status: 'order_confirmed'
    });

    await newOrder.save();

    // 재고 차감
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        { $inc: { stock: -cartItem.quantity } }
      );
    }

    // 장바구니 비우기
    await Cart.findByIdAndUpdate(cart._id, {
      items: [],
      totalAmount: 0,
      totalItems: 0
    });

    // 생성된 주문 조회 (populate 포함)
    const order = await Order.findById(newOrder._id)
      .populate('user', 'name email')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      data: order,
      message: '주문이 성공적으로 생성되었습니다.'
    });

  } catch (error) {
    console.error('주문 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 사용자의 주문 목록 조회
exports.getUserOrders = async (req, res) => {
  try {
    console.log('=== 주문 목록 조회 API 호출 ===');
    const userId = req.user._id;
    console.log('사용자 ID:', userId);
    console.log('사용자 정보:', {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    });
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('페이지네이션 정보:', { page, limit, skip });

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name sku image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('조회된 주문 개수:', orders.length);
    console.log('주문 목록:', orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.pricing?.total,
      createdAt: order.createdAt,
      itemsCount: order.items?.length
    })));

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    // 상태별 주문 수 계산 (실제 DB의 상태값 사용)
    const statusCounts = {
      total: totalOrders,
      pending: await Order.countDocuments({ user: userId, status: 'order_confirmed' }), // 주문완료
      preparing: await Order.countDocuments({ user: userId, status: 'preparing' }), // 상품준비중
      shipping: await Order.countDocuments({ user: userId, status: 'shipping_started' }), // 배송시작
      delivered: await Order.countDocuments({ user: userId, status: 'delivered' }), // 배송완료
      cancelled: await Order.countDocuments({ user: userId, status: 'cancelled' }) // 주문취소
    };

    console.log('전체 주문 개수:', totalOrders);
    console.log('전체 페이지 수:', totalPages);
    console.log('상태별 주문 수:', statusCounts);

    const responseData = {
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        statusCounts
      },
      message: '주문 목록을 성공적으로 조회했습니다.'
    };

    console.log('응답 데이터 구조:', {
      success: responseData.success,
      ordersLength: responseData.data.orders.length,
      pagination: responseData.data.pagination
    });

    res.json(responseData);

  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 특정 주문 상세 조회
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    })
    .populate('user', 'name email phone')
    .populate('items.product', 'name sku image category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: order,
      message: '주문 상세 정보를 성공적으로 조회했습니다.'
    });

  } catch (error) {
    console.error('주문 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 상세 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 주문 취소
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    // 주문 취소 가능 여부 확인
    const cancelResult = order.cancel(reason);
    
    if (!cancelResult) {
      return res.status(400).json({
        success: false,
        message: '이미 배송이 시작된 주문은 취소할 수 없습니다.'
      });
    }

    // 결제 상태도 취소로 변경
    order.payment.status = 'cancelled';
    await order.save();

    // 재고 복구
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      success: true,
      data: order,
      message: '주문이 성공적으로 취소되었습니다.'
    });

  } catch (error) {
    console.error('주문 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 취소 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// === 관리자 전용 기능 ===

// 모든 주문 조회 (관리자)
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const userId = req.query.userId;

    // 필터 조건 설정
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (userId) {
      filter.user = userId;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      message: '전체 주문 목록을 성공적으로 조회했습니다.'
    });

  } catch (error) {
    console.error('전체 주문 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '전체 주문 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 주문 상태 업데이트 (관리자)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, adminNotes, tracking } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    // 상태 업데이트
    order.status = status;
    
    // 관리자 메모 추가
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    // 배송 추적 정보 업데이트
    if (tracking) {
      order.tracking = { ...order.tracking, ...tracking };
    }

    // 배송 시작 시 결제 상태를 완료로 변경
    if (status === 'shipping_started' && order.payment.status === 'pending') {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
    }

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku');

    res.json({
      success: true,
      data: updatedOrder,
      message: '주문 상태가 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 상태 업데이트 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 주문 통계 조회 (관리자)
exports.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 오늘 주문 통계
    const todayStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' }
        }
      }
    ]);

    // 이번 달 주문 통계
    const monthStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' }
        }
      }
    ]);

    // 상태별 주문 수
    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        today: todayStats[0] || { totalOrders: 0, totalAmount: 0 },
        thisMonth: monthStats[0] || { totalOrders: 0, totalAmount: 0 },
        byStatus: statusStats
      },
      message: '주문 통계를 성공적으로 조회했습니다.'
    });

  } catch (error) {
    console.error('주문 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 결제 검증 및 주문 완료 처리
exports.verifyAndCompletePayment = async (req, res) => {
  try {
    const { imp_uid, merchant_uid, amount, shipping, payment, order } = req.body;
    
    console.log('결제 검증 요청 받음:', {
      imp_uid,
      merchant_uid,
      amount,
      userId: req.user._id,
      userEmail: req.user.email,
      hasOrderSnapshot: !!order
    });

    // 필수 파라미터 검증
    if (!imp_uid || !merchant_uid || !amount) {
      return res.status(400).json({
        success: false,
        message: '필수 결제 정보가 누락되었습니다.',
        error: `누락된 정보: ${!imp_uid ? 'imp_uid ' : ''}${!merchant_uid ? 'merchant_uid ' : ''}${!amount ? 'amount' : ''}`.trim()
      });
    }

    const userId = req.user._id;

    // 포트원 결제 검증
    const verificationResult = await verifyPayment(imp_uid, merchant_uid, amount);
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: '포트원 결제 검증에 실패했습니다.',
        error: verificationResult.error
      });
    }

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '장바구니가 비어있습니다.'
      });
    }

    // 재고 확인 및 주문 아이템 준비
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      // 상품 활성화 및 재고 확인
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `${product.name} 상품이 비활성화되었습니다.`
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} 상품의 재고가 부족합니다. (재고: ${product.stock}개)`
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productSnapshot: {
          sku: product.sku,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category
        },
        quantity: cartItem.quantity,
        selectedOptions: cartItem.selectedOptions || {},
        itemTotal: itemTotal
      });
    }

    // 배송비 계산 (현재는 0원으로 설정됨)
    const shippingFee = 0;
    const discount = req.body.discount || 0;
    const total = subtotal + shippingFee - discount;

    // 결제 금액 재검증
    if (total !== amount) {
      return res.status(400).json({
        success: false,
        message: '주문 금액과 결제 금액이 일치하지 않습니다.',
        error: `계산된 금액: ${total}원, 결제된 금액: ${amount}원`
      });
    }

    // 주문 생성
    let newOrder;
    try {
      newOrder = new Order({
        user: userId,
        items: orderItems,
        pricing: {
          subtotal,
          shippingFee,
          discount,
          total
        },
        shipping,
        payment: {
          ...payment,
          status: 'completed',
          paidAt: new Date(),
          imp_uid: imp_uid,
          merchant_uid: merchant_uid,
          amount: amount
        },
        status: 'order_confirmed'
      });

      await newOrder.save();
      console.log('주문 생성 성공:', newOrder.orderNumber);
      
    } catch (orderError) {
      console.error('주문 생성 실패:', orderError);
      
      // 주문번호 중복 에러 처리
      if (orderError.code === 11000 && orderError.keyPattern?.orderNumber) {
        return res.status(422).json({
          success: false,
          message: '주문번호 생성 중 중복이 발생했습니다. 잠시 후 다시 시도해주세요.',
          error: 'DUPLICATE_ORDER_NUMBER'
        });
      }
      
      // 기타 주문 생성 에러
      return res.status(422).json({
        success: false,
        message: '주문 생성 중 오류가 발생했습니다.',
        error: orderError.message
      });
    }

    // 재고 차감
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        { $inc: { stock: -cartItem.quantity } }
      );
    }

    // 장바구니 비우기
    await Cart.findByIdAndUpdate(cart._id, {
      items: [],
      totalAmount: 0,
      totalItems: 0
    });

    // 생성된 주문 조회 (populate 포함)
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('user', 'name email')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      data: {
        order: populatedOrder,
        paymentInfo: verificationResult.paymentInfo
      },
      message: '결제 검증 및 주문이 성공적으로 완료되었습니다.'
    });

  } catch (error) {
    console.error('결제 검증 및 주문 완료 오류:', error);
    res.status(500).json({
      success: false,
      message: '결제 검증 및 주문 완료 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};