const User = require('../models/User');

// CREATE - 새 유저 생성 (회원가입)
const createUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }

    // 새 유저 생성
    const user = new User({
      email,
      name,
      password,
      user_type: user_type || 'customer',
      address
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: '유저가 성공적으로 생성되었습니다.',
      data: user
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: '유저 생성 실패',
      error: error.message
    });
  }
};

// READ - 모든 유저 조회 (관리자만)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, user_type, search } = req.query;

    const query = {};

    // 유저 타입 필터
    if (user_type) {
      query.user_type = user_type;
    }

    // 검색 기능 (이름 또는 이메일)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 조회 실패',
      error: error.message
    });
  }
};

// READ - 특정 유저 조회
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 본인 또는 관리자만 조회 가능
    if (req.user._id.toString() !== id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 조회 실패',
      error: error.message
    });
  }
};

// UPDATE - 유저 정보 수정
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, user_type, address } = req.body;

    // 본인 또는 관리자만 수정 가능
    if (req.user._id.toString() !== id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '수정 권한이 없습니다.'
      });
    }

    // 이메일 중복 확인 (다른 유저와)
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: id } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '이미 사용 중인 이메일입니다.'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    
    // user_type은 관리자만 변경 가능
    if (user_type && req.user.user_type === 'admin') {
      updateData.user_type = user_type;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '유저 정보가 성공적으로 수정되었습니다.',
      data: user
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: '유저 정보 수정 실패',
      error: error.message
    });
  }
};

// UPDATE - 비밀번호 변경
const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // 본인만 비밀번호 변경 가능
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: '본인의 비밀번호만 변경할 수 있습니다.'
      });
    }

    const user = await User.findById(id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      });
    }

    // 새 비밀번호 설정
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: '비밀번호 변경 실패',
      error: error.message
    });
  }
};

// DELETE - 유저 삭제
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 본인 또는 관리자만 삭제 가능
    if (req.user._id.toString() !== id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '삭제 권한이 없습니다.'
      });
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '유저가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 삭제 실패',
      error: error.message
    });
  }
};

// GET - 유저 통계 (관리자만)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const customerCount = await User.countDocuments({ user_type: 'customer' });
    const adminCount = await User.countDocuments({ user_type: 'admin' });
    
    // 최근 30일 가입자 수
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        customers: customerCount,
        admins: adminCount,
        recentSignups: recentUsers
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '통계 조회 실패',
      error: error.message
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  getUserStats
};