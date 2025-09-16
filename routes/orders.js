const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/checkout', async (req, res) => {
  const { full_name, address, phone, payment_method } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO orders (full_name, address, phone, payment_method)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [full_name, address, phone, payment_method]
    );

    res.status(201).json({ message: 'Đặt hàng thành công!', order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lưu đơn hàng' });
  }
});

module.exports = router;
