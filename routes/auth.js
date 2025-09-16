const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt'); // nếu bạn có hash mật khẩu

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    console.log('Người dùng gửi:', email, password);
    console.log('Tìm thấy user:', user);

    if (!user) {
      return res.status(401).json({ message: 'Email không tồn tại' });
    }

    // Nếu mật khẩu lưu ở DB là dạng plain-text (không khuyến khích), so sánh trực tiếp:
    if (user.password_hash !== password) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }

    // Nếu mật khẩu được hash, dùng bcrypt:
    // const match = await bcrypt.compare(password, user.password);
    // if (!match) return res.status(401).json({ message: 'Mật khẩu không đúng' });

    // Nếu đúng:
    return res.json({ message: 'Đăng nhập thành công', user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;