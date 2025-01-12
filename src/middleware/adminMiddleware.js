const admin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        message: '需要管理员权限' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ 
      message: '服务器错误，请稍后重试' 
    });
  }
};

module.exports = admin; 