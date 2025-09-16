// // index.js
// const express = require('express');
// const pool = require('./db');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(express.json());

// // API: Lấy danh sách sản phẩm
// app.get('/products', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM products ORDER BY id');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Lỗi server');
//   }
// });

// app.get('/products/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Lỗi server');
//   }
// });

// // Lấy giỏ hàng
// app.get('/cart', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT c.id, p.name, p.price, c.quantity 
//       FROM cart c 
//       JOIN products p ON c.product_id = p.id
//       ORDER BY c.id
//     `);
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Lỗi server");
//   }
// });

// // Kiểm tra xem sản phẩm đã có trong giỏ chưa, nếu có thì +1 số lượng
// // app.post('/cart', async (req, res) => {
// //   const { product_id, quantity } = req.body;

// //   try {
// //     const existing = await pool.query(
// //       "SELECT * FROM cart WHERE product_id = $1",
// //       [product_id]
// //     );

// //     if (existing.rows.length > 0) {
// //       // Update số lượng
// //       await pool.query(
// //         "UPDATE cart SET quantity = quantity + $1 WHERE product_id = $2",
// //         [quantity, product_id]
// //       );
// //     } else {
// //       // Thêm mới
// //       await pool.query(
// //         "INSERT INTO cart (product_id, quantity) VALUES ($1, $2)",
// //         [product_id, quantity]
// //       );
// //     }

// //     res.send("Thêm vào giỏ hàng thành công");
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Lỗi server");
// //   }
// // });



// // // Thêm sản phẩm vào giỏ
// // app.post('/cart', async (req, res) => {
// //   const { product_id, quantity } = req.body;
// //   try {
// //     await pool.query(
// //       'INSERT INTO cart (product_id, quantity) VALUES ($1, $2) RETURNING *',
// //       [product_id, quantity]
// //     );
// //     res.send("Thêm vào giỏ hàng thành công");
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Lỗi server");
// //   }
// // });

// // Thêm hoặc cập nhật sản phẩm trong giỏ
// app.post('/cart', async (req, res) => {
//   const { product_id, quantity } = req.body;

//   try {
//     // Kiểm tra sản phẩm đã tồn tại chưa
//     const existing = await pool.query(
//       "SELECT * FROM cart WHERE product_id = $1",
//       [product_id]
//     );

//     if (existing.rows.length > 0) {
//       // Nếu có thì update số lượng
//       const updated = await pool.query(
//         "UPDATE cart SET quantity = quantity + $1 WHERE product_id = $2 RETURNING *",
//         [quantity, product_id]
//       );
//       return res.json(updated.rows[0]);
//     } else {
//       // Nếu chưa có thì thêm mới
//       const inserted = await pool.query(
//         "INSERT INTO cart (product_id, quantity) VALUES ($1, $2) RETURNING *",
//         [product_id, quantity]
//       );
//       return res.json(inserted.rows[0]);
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Lỗi server khi thêm vào giỏ");
//   }
// });



// // Xóa sản phẩm khỏi giỏ
// app.delete('/cart/:id', async (req, res) => {
//   try {
//     await pool.query('DELETE FROM cart WHERE id=$1', [req.params.id]);
//     res.send("Xóa sản phẩm thành công");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Lỗi server");
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server đang chạy tại http://localhost:${PORT}`);
// });


// index.js
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // giữ nguyên file db của bạn
require('dotenv').config();
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');




const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000', // chỉ cho React app gọi
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type']
}));

app.use(cors());          // IMPORTANT: bật CORS
app.use(express.json());  // parse JSON

app.use('/api', authRoutes);
app.use('/api', orderRoutes);

// GET all products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).send('Lỗi server');
  }
});

// GET product by id
app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`GET /products/${id} error:`, err);
    res.status(500).send('Lỗi server');
  }
});

// GET cart (join với products để lấy tên, giá, ảnh)
app.get('/cart', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.product_id, p.name, p.price, p.image, c.quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      ORDER BY c.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /cart error:', err);
    res.status(500).send("Lỗi server khi lấy giỏ hàng");
  }
});

// POST /cart : thêm hoặc cập nhật item
app.post('/cart', async (req, res) => {
  try {
    console.log('POST /cart body:', req.body);
    const { product_id, quantity } = req.body;
    if (!product_id) return res.status(400).send('Thiếu product_id');

    const qty = parseInt(quantity || 1, 10);

    // Kiểm tra product tồn tại (tốt để tránh FK error)
    const prod = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
    if (prod.rows.length === 0) {
      return res.status(404).send('Product not found');
    }

    const existing = await pool.query('SELECT * FROM cart WHERE product_id = $1', [product_id]);

    if (existing.rows.length > 0) {
      const updated = await pool.query(
        'UPDATE cart SET quantity = quantity + $1, updated_at = NOW() WHERE product_id = $2 RETURNING *',
        [qty, product_id]
      );
      return res.status(200).json(updated.rows[0]);
    } else {
      const inserted = await pool.query(
        'INSERT INTO cart (product_id, quantity) VALUES ($1, $2) RETURNING *',
        [product_id, qty]
      );
      return res.status(201).json(inserted.rows[0]);
    }
  } catch (err) {
    console.error('POST /cart error:', err);
    res.status(500).send('Lỗi server khi thêm vào giỏ: ' + err.message);
  }
});

// PUT /cart/:id - cập nhật quantity (thay thế)
app.put('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const q = parseInt(quantity, 10);
    if (isNaN(q) || q < 1) return res.status(400).send('Số lượng không hợp lệ');

    const updated = await pool.query(
      'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [q, id]
    );
    if (updated.rows.length === 0) return res.status(404).send('Cart item not found');
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('PUT /cart/:id error:', err);
    res.status(500).send('Lỗi server');
  }
});

// DELETE /cart/:id
app.delete('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM cart WHERE id = $1', [id]);
    res.send('Xóa sản phẩm thành công');
  } catch (err) {
    console.error('DELETE /cart/:id error:', err);
    res.status(500).send('Lỗi server khi xóa');
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const checkUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    await pool.query(
       'INSERT INTO users (name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [name, email, password, 'user']
    );

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Email không tồn tại' });
    }

    // So sánh mật khẩu (nếu bạn hash thì dùng bcrypt.compare)
    if (user.rows[0].password_hash !== password) {
      return res.status(400).json({ message: 'Sai mật khẩu' });
    }

    res.status(200).json({ message: 'Đăng nhập thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
